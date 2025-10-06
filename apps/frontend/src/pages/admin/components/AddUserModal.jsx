import React from 'react';

import ErrorNotifier from '@app/components/ErrorNotifier';
import { useCreateTeacherMutation, useCreateUserMutation } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createTeacherSchema } from '../schemas/teacher.schema';
import { createUserSchema } from '../schemas/user.schema';

const AddUserModal = () => {
  const [open, setOpen] = React.useState(false);
  const [addUser, { isLoading: isUserLoading }] = useCreateUserMutation();
  const [addTeacher, { isLoading: isTeacherLoading }] = useCreateTeacherMutation();
  const [userType, setUserType] = React.useState('user');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(userType === 'user' ? createUserSchema : createTeacherSchema),
    defaultValues: {
      isActive: true,
      isAdmin: false
    }
  });

  const handleUserTypeChange = (event, newType) => {
    if (newType) {
      setUserType(newType);
      reset();
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      let response;
      if (userType === 'user') {
        response = await addUser(data);
      } else {
        response = await addTeacher(data);
      }
      if (!response.error) {
        toast.success(
          userType === 'user' ? 'User was successfully added.' : 'Teacher was successfully added.'
        );
        handleClose();
      } else {
        toast.error(`Error: ${response.error.data.message}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred.', error);
    }
  };

  return (
    <>
      <Button sx={{ minWidth: '10rem' }} variant="contained" onClick={handleClickOpen} fullWidth>
        Pridaj používateľa
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 3,
            minWidth: {
              md: '48rem',
              sm: '36rem',
              xs: '100%'
            },
            maxWidth: '100%'
          }}
        >
          <DialogTitle>Pridaj používateľa alebo učiteľa</DialogTitle>
          <ToggleButtonGroup
            color="primary"
            value={userType}
            exclusive
            onChange={handleUserTypeChange}
            sx={{ mb: 2, alignSelf: 'center' }}
          >
            <ToggleButton value="user">Používateľ</ToggleButton>
            <ToggleButton value="teacher">Učiteľ</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="Meno"
            variant="outlined"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />

          <TextField
            label="Priezvisko"
            variant="outlined"
            {...register('surname')}
            error={!!errors.surname}
            helperText={errors.surname?.message}
            fullWidth
          />

          <TextField
            label="Email"
            variant="outlined"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />

          {userType === 'user' && (
            <>
              <TextField
                label="Skupina"
                variant="outlined"
                {...register('groupNumber')}
                error={!!errors.groupNumber}
                helperText={errors.groupNumber?.message}
                fullWidth
              />
              <TextField
                label="Študentské číslo"
                variant="outlined"
                type="number"
                {...register('studentNumber')}
                error={!!errors.studentNumber}
                helperText={errors.studentNumber?.message}
                fullWidth
              />
              <FormControlLabel control={<Checkbox {...register('isActive')} />} label="Aktívny" />
              <FormControlLabel control={<Checkbox {...register('isAdmin')} />} label="Admin" />
            </>
          )}
          {userType === 'teacher' && (
            <>
              <FormControlLabel control={<Checkbox {...register('isActive')} />} label="Aktívny" />
              <FormControlLabel control={<Checkbox {...register('isAdmin')} />} label="Admin" />
            </>
          )}

          <TextField
            label="Heslo"
            type="password"
            variant="outlined"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
          />

          <TextField
            label="Potvrďte heslo"
            type="password"
            variant="outlined"
            {...register(userType === 'user' ? 'passwordConfirmation' : 'passwordConfirmation')}
            error={!!errors[userType === 'user' ? 'passwordConfirmation' : 'passwordConfirmation']}
            helperText={
              errors[userType === 'user' ? 'passwordConfirmation' : 'passwordConfirmation']?.message
            }
            fullWidth
          />

          <ErrorNotifier />

          <DialogActions>
            <Button onClick={handleClose} color="error" variant="outlined">
              Zruš
            </Button>
            <Button type="submit" variant="outlined" disabled={isUserLoading || isTeacherLoading}>
              Pridaj
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddUserModal;
