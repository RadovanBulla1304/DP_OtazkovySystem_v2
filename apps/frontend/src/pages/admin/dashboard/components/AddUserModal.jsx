import React from 'react';

import ErrorNotifier from '@app/components/ErrorNotifier';
import { useCreateTeacherMutation, useCreateUserMutation } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import { Add } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createTeacherSchema } from '../../schemas/teacher.schema';
import { createUserSchema } from '../../schemas/user.schema';

const AddUserModal = () => {
  const [open, setOpen] = React.useState(false);
  const [addUser, { isLoading: isUserLoading }] = useCreateUserMutation();
  const [addTeacher, { isLoading: isTeacherLoading }] = useCreateTeacherMutation();
  const [userType, setUserType] = React.useState('user');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm({
    mode: 'onChange',
    resolver: joiResolver(userType === 'user' ? createUserSchema : createTeacherSchema),
    defaultValues: {
      isActive: true,
      isAdmin: false
    }
  });

  // Watch required fields
  const name = watch('name');
  const surname = watch('surname');
  const email = watch('email');
  const password = watch('password');
  const passwordConfirmation = watch('passwordConfirmation');
  const groupNumber = watch('groupNumber');
  const studentNumber = watch('studentNumber');

  // Check if form is valid
  const isFormValid = () => {
    if (userType === 'user') {
      return (
        name?.trim() &&
        surname?.trim() &&
        email?.trim() &&
        groupNumber?.trim() &&
        studentNumber &&
        password?.trim() &&
        passwordConfirmation?.trim() &&
        isValid
      );
    } else {
      return (
        name?.trim() &&
        surname?.trim() &&
        email?.trim() &&
        password?.trim() &&
        passwordConfirmation?.trim() &&
        isValid
      );
    }
  };

  const handleUserTypeChange = (event, newType) => {
    if (newType) {
      setUserType(newType);
      reset({
        isActive: true,
        isAdmin: false
      });
    }
  };

  const handleClickOpen = () => {
    reset({
      isActive: true,
      isAdmin: false
    });
    setOpen(true);
  };

  const handleClose = () => {
    reset({
      isActive: true,
      isAdmin: false
    });
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      // Ensure isActive is true and isAdmin is false
      const submissionData = {
        ...data,
        isActive: true,
        isAdmin: false
      };

      let response;
      if (userType === 'user') {
        response = await addUser(submissionData);
      } else {
        response = await addTeacher(submissionData);
      }
      if (!response.error) {
        toast.success(
          userType === 'user' ? 'Používateľ bol úspešne pridaný' : 'Učiteľ bol úspešne pridaný'
        );
        reset();
        handleClose();
      } else {
        toast.error(`Chyba: ${response.error.data.message}`);
      }
    } catch (error) {
      toast.error('Vyskytla sa neočakávaná chyba', error);
    }
  };

  return (
    <>
      <Button startIcon={<Add />} size="medium" variant="contained" onClick={handleClickOpen}>
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
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <DialogTitle sx={{ fontWeight: 600, p: 0 }}>
              Pridaj používateľa alebo učiteľa
            </DialogTitle>
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
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Meno"
                variant="outlined"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Priezvisko"
                variant="outlined"
                {...register('surname')}
                error={!!errors.surname}
                helperText={errors.surname?.message}
                fullWidth
                required
              />
            </Grid>
          </Grid>

          <TextField
            label="Email"
            variant="outlined"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
            required
          />

          {userType === 'user' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Skupina"
                  variant="outlined"
                  {...register('groupNumber')}
                  error={!!errors.groupNumber}
                  helperText={errors.groupNumber?.message}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Študentské číslo"
                  variant="outlined"
                  type="number"
                  {...register('studentNumber')}
                  error={!!errors.studentNumber}
                  helperText={errors.studentNumber?.message}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          )}

          <TextField
            label="Heslo"
            type="password"
            variant="outlined"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
            required
          />

          <TextField
            label="Potvrďte heslo"
            type="password"
            variant="outlined"
            {...register('passwordConfirmation')}
            error={!!errors.passwordConfirmation}
            helperText={errors.passwordConfirmation?.message}
            fullWidth
            required
          />

          <ErrorNotifier />

          <DialogActions>
            <Button
              onClick={handleClose}
              variant="outlined"
              disabled={isUserLoading || isTeacherLoading}
              color="error"
            >
              Zrušiť
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isUserLoading || isTeacherLoading || !isFormValid()}
            >
              Pridaj
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddUserModal;
