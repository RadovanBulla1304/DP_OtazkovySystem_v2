import React from 'react';

import ErrorNotifier from '@app/components/ErrorNotifier';
import { useCreateUserMutation } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  TextField
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createUserSchema } from '../schemas/createUser.schema';

const AddUserModal = () => {
  const [open, setOpen] = React.useState(false);
  const [addUser, { isLoading }] = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(createUserSchema),
    defaultValues: {
      isActive: true,
      isAdmin: false,
    }
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const response = await addUser(data);
      if (!response.error) {
        toast.success('User was successfully added.');
        handleClose();
      } else {
        toast.error(`Error: ${response.error.data.message}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <>
      <Button
        sx={{ m: 1, minWidth: '15rem' }}
        variant="contained"
        onClick={handleClickOpen}
        fullWidth
      >
        Pridaj používateľa
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mx: 'auto',
            minWidth: {
              md: '30rem',
            },
          }}
        >
          <DialogTitle>Pridaj používateľa</DialogTitle>

          <TextField
            label="Name"
            variant="outlined"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />

          <TextField
            label="Surname"
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

          <FormControlLabel
            control={<Checkbox {...register('isActive')} />}
            label="Is Active"
          />
          {errors.isActive && (
            <p style={{ color: 'red', fontSize: '0.875rem' }}>{errors.isActive.message}</p>
          )}

          <FormControlLabel
            control={<Checkbox {...register('isAdmin')} />}
            label="Is Admin"
          />
          {errors.isAdmin && (
            <p style={{ color: 'red', fontSize: '0.875rem' }}>{errors.isAdmin.message}</p>
          )}

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
          />

          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            {...register('passwordConfirmation')}
            error={!!errors.passwordConfirmation}
            helperText={errors.passwordConfirmation?.message}
            fullWidth
          />

          <ErrorNotifier />

          <DialogActions>
            <Button onClick={handleClose} color="error" variant="outlined">
              Zruš
            </Button>
            <Button
              type="submit"
              variant="outlined"
              disabled={isLoading}
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
