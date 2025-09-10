import React from 'react';

import { useUpdateTeacherMutation, useUpdateUserMutation } from '@app/redux/api';
import EditIcon from '@mui/icons-material/Edit';

import ErrorNotifier from '@app/components/ErrorNotifier';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { updateTeacherSchema } from '../schemas/teacher.schema';
import { updateUserSchema } from '../schemas/user.schema';

const EditUserModal = ({ userData, isTeacher }) => {
  const [open, setOpen] = React.useState(false);
  const [updateUser, { isLoading: isUserLoading }] = useUpdateUserMutation();
  const [updateTeacher, { isLoading: isTeacherLoading }] = useUpdateTeacherMutation();

  const schema = isTeacher ? updateTeacherSchema : updateUserSchema;
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: joiResolver(schema),
    defaultValues: {
      name: userData.name || '',
      surname: userData.surname || '',
      email: userData.email || '',
      groupNumber: userData.groupNumber || '',
      studentNumber: userData.studentNumber || '',
      isAdmin: userData.isAdmin || userData.is_admin || false,
      isActive: userData.isActive || userData.is_active || false
    }
  });

  const handleClickOpen = () => {
    setValue('name', userData.name);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (data) => {
    let response;
    if (isTeacher) {
      response = await updateTeacher({ data, teacherId: userData._id });
    } else {
      response = await updateUser({ data, userId: userData._id });
    }
    if (!response.error) {
      toast.success(
        isTeacher ? 'Učiteľ bol úspešne aktualizovaný' : 'Užívateľ bol úspešne aktualizovaný'
      );
      handleClose();
    }
  };

  return (
    <>
      <Tooltip title={isTeacher ? 'Uprav učiteľa' : 'Uprav používateľa'} key={'edit'}>
        <IconButton color="primary" onClick={handleClickOpen}>
          <EditIcon />
        </IconButton>
      </Tooltip>
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
          <DialogTitle>{isTeacher ? 'Uprav učiteľa' : 'Uprav používateľa'}</DialogTitle>
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
          {!isTeacher && (
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
                {...register('studentNumber')}
                error={!!errors.studentNumber}
                helperText={errors.studentNumber?.message}
                fullWidth
              />
            </>
          )}
          <Controller
            name="isAdmin"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Admin"
              />
            )}
          />
          {errors.isAdmin && <Typography color="error">{errors.isAdmin.message}</Typography>}
          <Controller
            name="isActive"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Aktívny"
              />
            )}
          />
          {errors.isActive && <Typography color="error">{errors.isActive.message}</Typography>}
          <ErrorNotifier />
          <DialogActions>
            <Button onClick={handleClose} color="error" variant="outlined">
              Zruš
            </Button>
            <Button type="submit" variant="outlined" disabled={isUserLoading || isTeacherLoading}>
              Uprav
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

EditUserModal.propTypes = {
  userData: PropTypes.object.isRequired,
  isTeacher: PropTypes.bool
};

export default EditUserModal;
