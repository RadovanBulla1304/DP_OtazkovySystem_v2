import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sk } from 'date-fns/locale';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const CustomPhasesDialog = ({ open, onClose, onConfirm, initialValues }) => {
  const [dateStart, setDateStart] = useState(initialValues?.date_start || null);
  const [week2Start, setWeek2Start] = useState(initialValues?.week2_start || null);
  const [week3Start, setWeek3Start] = useState(initialValues?.week3_start || null);
  const [dateEnd, setDateEnd] = useState(initialValues?.date_end || null);

  useEffect(() => {
    if (open) {
      const start = initialValues?.date_start || null;
      const end = initialValues?.date_end || null;
      let w2 = initialValues?.week2_start || null;
      let w3 = initialValues?.week3_start || null;

      // Auto-split into thirds when start+end are known but week splits are missing
      if (start && end && !w2 && !w3) {
        const totalMs = end.getTime() - start.getTime();
        w2 = new Date(start.getTime() + totalMs / 3);
        w3 = new Date(start.getTime() + (totalMs * 2) / 3);
      }

      setDateStart(start);
      setWeek2Start(w2);
      setWeek3Start(w3);
      setDateEnd(end);
    }
  }, [open, initialValues]);

  const handleConfirm = () => {
    if (!dateStart || !week2Start || !week3Start || !dateEnd) {
      toast.error('Vyplňte všetky 4 dátumy.');
      return;
    }
    if (week2Start <= dateStart) {
      toast.error('Začiatok 2. týždňa musí byť po začiatku modulu.');
      return;
    }
    if (week3Start <= week2Start) {
      toast.error('Začiatok 3. týždňa musí byť po začiatku 2. týždňa.');
      return;
    }
    if (dateEnd <= week3Start) {
      toast.error('Ukončenie modulu musí byť po začiatku 3. týždňa.');
      return;
    }
    onConfirm({
      date_start: dateStart,
      week2_start: week2Start,
      week3_start: week3Start,
      date_end: dateEnd
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Vlastné termíny fáz modulu</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={sk}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                1. týždeň — Tvorba otázok
              </Typography>
              <DatePicker
                label="Začiatok modulu"
                value={dateStart}
                onChange={(d) => setDateStart(d)}
                format="dd/MM/yyyy"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Prepnutie 1. → 2. týždeň — Validácia
              </Typography>
              <DatePicker
                label="Začiatok 2. týždňa"
                value={week2Start}
                onChange={(d) => setWeek2Start(d)}
                minDate={dateStart || undefined}
                format="dd/MM/yyyy"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Prepnutie 2. → 3. týždeň — Reparácia
              </Typography>
              <DatePicker
                label="Začiatok 3. týždňa"
                value={week3Start}
                onChange={(d) => setWeek3Start(d)}
                minDate={week2Start || undefined}
                format="dd/MM/yyyy"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Koniec modulu
              </Typography>
              <DatePicker
                label="Ukončenie modulu"
                value={dateEnd}
                onChange={(d) => {
                  if (d) {
                    const end = new Date(d);
                    end.setHours(23, 59, 59, 999);
                    setDateEnd(end);
                  } else {
                    setDateEnd(null);
                  }
                }}
                minDate={week3Start || undefined}
                format="dd/MM/yyyy"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Stack>
          </Stack>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" color="error" onClick={onClose}>
          Zrušiť
        </Button>
        <Button variant="contained" onClick={handleConfirm}>
          Potvrdiť
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CustomPhasesDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    date_start: PropTypes.instanceOf(Date),
    week2_start: PropTypes.instanceOf(Date),
    week3_start: PropTypes.instanceOf(Date),
    date_end: PropTypes.instanceOf(Date)
  })
};

export default CustomPhasesDialog;
