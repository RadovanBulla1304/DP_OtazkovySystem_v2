import { useCreateModulMutation, useGetTeacherMeQuery, useGetUserMeQuery } from '@app/redux/api';
import { joiResolver } from '@hookform/resolvers/joi';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sk } from 'date-fns/locale';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createModulSchema } from '../../schemas/modul.schema';

const AddModulModal = ({ open, onClose, subjectId, onSuccess }) => {
  const [createModul, { isLoading }] = useCreateModulMutation();
  const { data: currentUser } = useGetUserMeQuery();
  const { data: currentTeacher } = useGetTeacherMeQuery();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm({
    resolver: joiResolver(createModulSchema),
    mode: 'onChange', // Enable validation on change
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
        createdBy: currentTeacher?._id || currentUser?._id
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
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2, width: '100%' }}>
        <DialogTitle id="modal-modal-title" sx={{ fontWeight: 600, p: 0, pb: 2 }}>
          Pridať nový modul
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
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

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={sk}>
              <Controller
                name="date_start"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Dátum začiatku"
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    disabled={isLoading}
                    format="dd/MM/yyyy"
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
                        // Calculate end date: add (weeks * 7 - 1) days to get the last day of the period
                        // Then set time to 23:59:59.999 to include the entire last day
                        newEnd.setDate(newEnd.getDate() + (weeks * 7 - 1));
                        newEnd.setHours(23, 59, 59, 999);
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
                    format="dd/MM/yyyy"
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

            <DialogActions>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isLoading}
                  color="error"
                >
                  Zrušiť
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? 'Ukladá sa...' : 'Pridať'}
                </Button>
              </Box>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

AddModulModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subjectId: PropTypes.string,
  onSuccess: PropTypes.func
};

export default AddModulModal;
