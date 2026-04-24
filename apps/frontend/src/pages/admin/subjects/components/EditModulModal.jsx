import { useEditModulMutation } from '@app/redux/api';
import { Box, Button, Chip, DialogTitle, Modal, Stack, TextField, Tooltip } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sk } from 'date-fns/locale';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CustomPhasesDialog from './CustomPhasesDialog';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'calc(100% - 24px)',
  maxWidth: 420,
  backgroundColor: (theme) =>
    theme.palette.mode === 'dark' ? theme.palette.background.default : 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  borderRadius: 2
};

const EditModulModal = ({ open, onClose, onSuccess, modul }) => {
  const [editModul, { isLoading }] = useEditModulMutation();
  const [customPhasesOpen, setCustomPhasesOpen] = useState(false);

  const toDate = (val) => (val ? dayjs(val).toDate() : null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: modul?.title || '',
      date_start: toDate(modul?.date_start),
      date_end: toDate(modul?.date_end),
      week2_start: toDate(modul?.week2_start),
      week3_start: toDate(modul?.week3_start)
    }
  });

  const startDate = watch('date_start');
  const week2Start = watch('week2_start');
  const week3Start = watch('week3_start');

  useEffect(() => {
    reset({
      title: modul?.title || '',
      date_start: toDate(modul?.date_start),
      date_end: toDate(modul?.date_end),
      week2_start: toDate(modul?.week2_start),
      week3_start: toDate(modul?.week3_start)
    });
  }, [modul, open, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        date_start: data.date_start ? data.date_start.toISOString() : undefined,
        date_end: data.date_end ? data.date_end.toISOString() : undefined,
        week2_start: data.week2_start ? data.week2_start.toISOString() : null,
        week3_start: data.week3_start ? data.week3_start.toISOString() : null
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

  const handleCustomPhasesConfirm = (data) => {
    setValue('date_start', data.date_start);
    setValue('week2_start', data.week2_start);
    setValue('week3_start', data.week3_start);
    setValue('date_end', data.date_end);
  };

  const hasCustomPhases = !!(week2Start || week3Start);

  return (
    <>
    <Modal open={open} onClose={handleCancel} aria-labelledby="modal-editmodul-title">
      <Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle id="modal-editmodul-title" sx={{ fontWeight: 600, p: 0, mb: 3 }}>
          Upraviť modul
        </DialogTitle>

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
                    textField: { fullWidth: true }
                  }}
                />
              )}
            />

            {/* Duration / phase buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {[1, 2, 3].map((weeks) => (
                <Button
                  key={weeks}
                  variant="outlined"
                  size="small"
                  disabled={!startDate || isLoading}
                  onClick={() => {
                    const newEnd = new Date(startDate);
                    newEnd.setDate(newEnd.getDate() + weeks * 7 - 1);
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
                    textField: { fullWidth: true }
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
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
              {isLoading ? 'Ukladá sa...' : 'Uložiť'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>

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

EditModulModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  modul: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    date_start: PropTypes.string,
    date_end: PropTypes.string,
    week2_start: PropTypes.string,
    week3_start: PropTypes.string
  })
};

export default EditModulModal;
