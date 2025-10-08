import { useEditModulMutation } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { editModulSchema } from '../../schemas/modul.schema';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const EditModulModal = ({ open, onClose, onSuccess, modul }) => {
  const [editModul, { isLoading }] = useEditModulMutation();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: joiResolver(editModulSchema),
    defaultValues: {
      title: modul?.title || '',
      date_start: modul?.date_start ? dayjs(modul.date_start).toDate() : null,
      date_end: modul?.date_end ? dayjs(modul.date_end).toDate() : null
    }
  });

  // Watch start date to set minDate for end date
  const startDate = watch('date_start');

  // Update form values when modul changes
  useEffect(() => {
    setValue('title', modul?.title || '');
    setValue('date_start', modul?.date_start ? dayjs(modul.date_start).toDate() : null);
    setValue('date_end', modul?.date_end ? dayjs(modul.date_end).toDate() : null);
    reset({
      title: modul?.title || '',
      date_start: modul?.date_start ? dayjs(modul.date_start).toDate() : null,
      date_end: modul?.date_end ? dayjs(modul.date_end).toDate() : null
    });
    // eslint-disable-next-line
  }, [modul, open, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        date_start: data.date_start ? data.date_start.toISOString() : undefined,
        date_end: data.date_end ? data.date_end.toISOString() : undefined
      };
      await editModul({ modulId: modul._id, data: payload }).unwrap();
      toast.success('Modul bol úspešne upravený');
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('API error:', error);
      toast.error('Nepodarilo sa upraviť modul. Skúste znova.');
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel} aria-labelledby="modal-editmodul-title">
      <Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography id="modal-editmodul-title" variant="h6" component="h2" mb={3}>
          Upraviť modul
        </Typography>

        <Stack spacing={3}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Názov modulu"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                disabled={isLoading}
              />
            )}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
              name="date_start"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Dátum začiatku"
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  disabled={isLoading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date_start,
                      helperText: errors.date_start?.message
                    }
                  }}
                />
              )}
            />
            <Controller
              name="date_end"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Dátum konca"
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  disabled={isLoading || !startDate}
                  minDate={startDate || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date_end,
                      helperText: errors.date_end?.message
                    }
                  }}
                />
              )}
            />
          </LocalizationProvider>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleCancel} disabled={isLoading}>
              Zrušiť
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? 'Ukladá sa...' : 'Uložiť'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

EditModulModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  modul: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    date_start: PropTypes.string,
    date_end: PropTypes.string
  })
};

export default EditModulModal;
