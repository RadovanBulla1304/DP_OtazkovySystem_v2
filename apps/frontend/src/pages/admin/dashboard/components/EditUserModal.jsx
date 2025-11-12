import React from 'react';

import { useUpdateTeacherMutation, useUpdateUserMutation } from '@app/redux/api';
import EditIcon from '@mui/icons-material/Edit';

import ErrorNotifier from '@app/components/ErrorNotifier';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Tooltip
} from '@mui/material';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { updateTeacherSchema } from '../../schemas/teacher.schema';
import { updateUserSchema } from '../../schemas/user.schema';

const EditUserModal = ({ userData, isTeacher }) => {
  const [open, setOpen] = React.useState(false);
  const [updateUser, { isLoading: isUserLoading }] = useUpdateUserMutation();
  const [updateTeacher, { isLoading: isTeacherLoading }] = useUpdateTeacherMutation();

  const schema = isTeacher ? updateTeacherSchema : updateUserSchema;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm({
    mode: 'all', // Changed from 'onChange' to 'all' to validate immediately including on mount
    resolver: joiResolver(schema),
    defaultValues: {
      name: userData.name || '',
      surname: userData.surname || '',
      email: userData.email || '',
      groupNumber: String(userData.groupNumber || userData.group_number || ''),
      studentNumber: String(userData.studentNumber || userData.student_number || ''),
      isAdmin: userData.isAdmin || userData.is_admin || false,
      isActive: userData.isActive || userData.is_active || false
    }
  });

  const handleClickOpen = () => {
    reset({
      name: userData.name || '',
      surname: userData.surname || '',
      email: userData.email || '',
      groupNumber: String(userData.groupNumber || userData.group_number || ''),
      studentNumber: String(userData.studentNumber || userData.student_number || ''),
      isAdmin: userData.isAdmin || userData.is_admin || false,
      isActive: userData.isActive || userData.is_active || false
    });
    setOpen(true);
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      let response;
      if (isTeacher) {
        response = await updateTeacher({ data, teacherId: userData._id });
      } else {
        response = await updateUser({ data, userId: userData._id });
      }
      if (!response.error) {
        toast.success(
          isTeacher ? 'Učiteľ bol úspešne aktualizovaný' : 'Používateľ bol úspešne aktualizovaný'
        );
        handleClose();
      } else {
        toast.error('Chyba pri aktualizácii: ' + response.error?.data?.message);
      }
    } catch (error) {
      console.error('Error during update:', error);
      toast.error('Chyba pri aktualizácii');
    }
  };

  return (
    <>
      <Tooltip title={isTeacher ? 'Upraviť učiteľa' : 'Upraviť používateľa'} key={'edit'}>
        <IconButton color="primary" onClick={handleClickOpen}>
          <EditIcon />
        </IconButton>
      </Tooltip>
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
          <DialogTitle sx={{ fontWeight: 600, p: 0 }}>
            {isTeacher ? 'Upraviť učiteľa' : 'Upraviť používateľa'}
          </DialogTitle>

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

          {!isTeacher && (
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
              disabled={isUserLoading || isTeacherLoading || !isValid}
            >
              Uložiť
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
