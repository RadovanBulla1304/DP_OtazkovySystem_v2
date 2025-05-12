import React from 'react';

import ErrorNotifier from '@app/components/ErrorNotifier';
import { useAddStudentMutation, useAddEmployeeOrAdminMutation } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createUserSchema } from '../schemas/createUser.schema';

const AddUserModal = () => {
  const [open, setOpen] = React.useState(false);
  const [userType, setUserType] = React.useState('student'); // Default userType: student
  const [addStudent, { isLoading: isAddingStudent }] = useAddStudentMutation();
  const [addEmployeeOrAdmin, { isLoading: isAddingEmployeeOrAdmin }] = useAddEmployeeOrAdminMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(createUserSchema),
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      if (userType === 'student') {
        const isValidISIC = /^[A-Za-z][0-9]{12}[A-Za-z]$/.test(data.password);
        if (!isValidISIC) {
          toast.error('Password must follow the ISIC format: Letter + 12 digits + Letter.');
          return;
        }
        const response = await addStudent(data);
        if (!response.error) {
          toast.success('Student was successfully added.');
          handleClose();
        } else {
          toast.error(`Error: ${response.error.data.message}`);
        }
      } else {
        data.userType = userType;
        const response = await addEmployeeOrAdmin(data);
        if (!response.error) {
          toast.success('Employee was successfully added.');
          handleClose();
        } else {
          toast.error(`Error: ${response.error.data.message}`);
        }
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
        component={'form'}
        onSubmit={handleSubmit(onSubmit)}
      >
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mx: 'auto',
            minWidth: {
              md: '30rem'
            }
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

          <TextField
            label="Personal Number"
            variant="outlined"
            {...register('personalNumber')}
            error={!!errors.personalNumber}
            helperText={errors.personalNumber?.message}
            fullWidth
          />

          <FormControl fullWidth>
            <Typography>User Type</Typography>
            <Controller
              name="userType"
              control={control}
              defaultValue="student"
              render={({ field }) => (
                <Select
                  {...field}
                  value={userType}
                  onChange={(e) => {
                    setUserType(e.target.value);
                    setValue('userType', e.target.value);
                  }}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            {...register('password')}
            error={!!errors.password}
            helperText={
              userType === 'student'
                ? 'Password must follow ISIC format: Letter + 12 digits + Letter.'
                : errors.password?.message
            }
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
              disabled={isAddingStudent || isAddingEmployeeOrAdmin}
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
