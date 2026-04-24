import * as authService from '@app/pages/auth/authService';
import { useCreateModulMutation, useGetTeacherMeQuery, useGetUserMeQuery } from '@app/redux/api';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sk } from 'date-fns/locale';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CustomPhasesDialog from './CustomPhasesDialog';

const AddModulModal = ({ open, onClose, subjectId, onSuccess }) => {
  const [createModul, { isLoading }] = useCreateModulMutation();
  const [customPhasesOpen, setCustomPhasesOpen] = useState(false);
  const storedUser = authService.getUserFromStorage();
  const isTeacherFromStorage = storedUser?.isTeacher === true;
  const { data: currentUser } = useGetUserMeQuery(undefined, {
    skip: isTeacherFromStorage
  });
  const { data: currentTeacher } = useGetTeacherMeQuery(undefined, {
    skip: !isTeacherFromStorage
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      date_start: null,
      date_end: null,
      week2_start: null,
      week3_start: null,
      required_questions_per_user: 2,
      subject: ''
    }
  });

  // Watch the start date to enable/disable end date picker
  const startDate = watch('date_start');
  const week2Start = watch('week2_start');
  const week3Start = watch('week3_start');
  const hasCustomPhases = !!(week2Start || week3Start);

  // Set subject ID
  useEffect(() => {
    if (open && subjectId) {
      setValue('subject', subjectId);
    }
  }, [open, subjectId, setValue]);

  const handleCustomPhasesConfirm = (data) => {
    setValue('date_start', data.date_start);
    setValue('week2_start', data.week2_start);
    setValue('week3_start', data.week3_start);
    setValue('date_end', data.date_end);
  };

  const onSubmit = async (data) => {
    if (!data.title) {
      toast.error('Názov modulu je povinný.');
      return;
    }
    if (!data.date_start || !data.date_end) {
      toast.error('Dátum začiatku a konca sú povinné.');
      return;
    }
    try {
      const payload = {
        title: data.title,
        description: data.description,
        date_start: data.date_start.toISOString(),
        date_end: data.date_end.toISOString(),
        week2_start: data.week2_start ? data.week2_start.toISOString() : undefined,
        week3_start: data.week3_start ? data.week3_start.toISOString() : undefined,
        subject: data.subject,
        is_active: true,
        required_questions_per_user: Number(data.required_questions_per_user),
        createdBy: currentTeacher?._id || currentUser?._id
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
    <>
      <Dialog
        open={open}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            mx: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ p: { xs: 1.5, sm: 2 }, width: '100%' }}
        >
          <DialogTitle id="modal-modal-title" sx={{ fontWeight: 600, p: 0, pb: 2 }}>
            Pridať nový modul
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Stack spacing={3}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Názov modulu je povinný.' }}
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
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  {[1, 2, 3].map((weeks) => (
                    <Button
                      key={weeks}
                      variant="outlined"
                      size="small"
                      disabled={!startDate || isLoading}
                      onClick={() => {
                        const newEnd = new Date(startDate);
                        newEnd.setDate(newEnd.getDate() + (weeks * 7 - 1));
                        newEnd.setHours(23, 59, 59, 999);
                        setValue('date_end', newEnd);
                        setValue('week2_start', null);
                        setValue('week3_start', null);
                      }}
                    >
                      {weeks} týždeň{weeks > 1 ? 'e' : ''}
                    </Button>
                  ))}
                  <Tooltip title="Nastaviť vlastné termíny pre každú fázu modulu">
                    <Button
                      variant={hasCustomPhases ? 'contained' : 'outlined'}
                      size="small"
                      color={hasCustomPhases ? 'secondary' : 'primary'}
                      disabled={isLoading}
                      onClick={() => setCustomPhasesOpen(true)}
                    >
                      Vlastné{hasCustomPhases ? ' ✓' : ''}
                    </Button>
                  </Tooltip>
                </Box>

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

                {hasCustomPhases && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {week2Start && (
                      <Chip
                        label={`2. týždeň od: ${dayjs(week2Start).format('DD/MM/YYYY')}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                    {week3Start && (
                      <Chip
                        label={`3. týždeň od: ${dayjs(week3Start).format('DD/MM/YYYY')}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                )}
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

              <DialogActions disableSpacing>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: { xs: 'stretch', sm: 'flex-end' },
                    gap: 1,
                    flexWrap: 'wrap',
                    width: '100%'
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isLoading}
                    color="error"
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Zrušiť
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    {isLoading ? 'Ukladá sa...' : 'Pridať'}
                  </Button>
                </Box>
              </DialogActions>
            </Stack>
          </DialogContent>
        </Box>
      </Dialog>

      {customPhasesOpen && (
        <CustomPhasesDialog
          open={customPhasesOpen}
          onClose={() => setCustomPhasesOpen(false)}
          onConfirm={handleCustomPhasesConfirm}
          initialValues={{
            date_start: startDate,
            week2_start: week2Start,
            week3_start: week3Start,
            date_end: watch('date_end')
          }}
        />
      )}
    </>
  );
};

AddModulModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subjectId: PropTypes.string,
  onSuccess: PropTypes.func
};

export default AddModulModal;
