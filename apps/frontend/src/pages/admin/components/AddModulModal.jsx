import { useCreateModulMutation } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createModulSchema } from '../schemas/modul.schema';

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

const AddModulModal = ({ open, onClose, subjectId, onSuccess }) => {
  const [createModul, { isLoading }] = useCreateModulMutation();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: joiResolver(createModulSchema),
    defaultValues: {
      title: '',
      date_start: null,
      date_end: null,
      subject: ''
    }
  });

  // Watch the start date to enable/disable end date picker
  const startDate = watch('date_start');

  // Set subject ID
  useEffect(() => {
    if (open && subjectId) {
      setValue('subject', subjectId);
    }
  }, [open, subjectId, setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        date_start: data.date_start.toISOString(),
        date_end: data.date_end.toISOString()
      };
      await createModul(payload).unwrap();
      toast.success('Modul bol úspešne pridaný');
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('API error:', error);
      toast.error('Nepodarilo sa pridať modul. Skúste znova.');
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel} aria-labelledby="modal-modal-title">
      <Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography id="modal-modal-title" variant="h6" component="h2" mb={3}>
          Pridať nový modul
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

AddModulModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subjectId: PropTypes.string,
  onSuccess: PropTypes.func
};

export default AddModulModal;
