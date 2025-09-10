import { useCreateModulMutation, useGetUserMeQuery } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Box,
  Button,
  FormControlLabel,
  Modal,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
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
  const { data: currentUser } = useGetUserMeQuery();

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
      description: '',
      // week_number is computed, not set manually
      date_start: null,
      date_end: null,
      required_questions_per_user: 2,
      is_active: true,
      subject: ''
    }
  });

  // Watch the start date to enable/disable end date picker
  const startDate = watch('date_start');
  // const endDate = watch('date_end');
  // const isActive = watch('is_active');

  // Set subject ID
  useEffect(() => {
    if (open && subjectId) {
      setValue('subject', subjectId);
    }
  }, [open, subjectId, setValue]);

  const onSubmit = async (data) => {
    console.log('Form data to submit:', data);
    try {
      // Only send required fields for creation
      const payload = {
        title: data.title,
        description: data.description,
        date_start: data.date_start.toISOString(),
        date_end: data.date_end.toISOString(),
        subject: data.subject,
        is_active: Boolean(data.is_active),
        required_questions_per_user: Number(data.required_questions_per_user),
        created_by: currentUser?._id
      };
      console.log('Constructed payload:', payload);
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

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Popis modulu"
                fullWidth
                multiline
                minRows={2}
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={isLoading}
              />
            )}
          />

          {/* week_number is computed automatically and not set manually */}

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

            {/* Week duration buttons */}
            {startDate && (
              <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                {[1, 2, 3].map((weeks) => (
                  <Button
                    key={weeks}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const newEnd = new Date(startDate);
                      newEnd.setDate(newEnd.getDate() + 7 * weeks - 1);
                      setValue('date_end', newEnd);
                    }}
                  >
                    {weeks} týždeň{weeks > 1 ? 'e' : ''}
                  </Button>
                ))}
              </Box>
            )}

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

          <Controller
            name="required_questions_per_user"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Počet povinných otázok na užívateľa"
                type="number"
                fullWidth
                error={!!errors.required_questions_per_user}
                helperText={errors.required_questions_per_user?.message}
                disabled={isLoading}
                inputProps={{ min: 1 }}
              />
            )}
          />

          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={!!field.value}
                    onChange={(_, checked) => field.onChange(checked)}
                    color="primary"
                    disabled={isLoading}
                  />
                }
                label="Modul je aktívny"
              />
            )}
          />

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
