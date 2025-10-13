import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';

const StartTestConfirmationModal = ({ test, open, onClose, onConfirm }) => {
  if (!test) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Spustiť test ?</DialogTitle>
      <DialogContent>
        <Box>
          <Typography variant="h6" gutterBottom>
            {test.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {test.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Počet otázok:</strong> {test.total_questions}
            </Typography>
            <Typography variant="body2">
              <strong>Časový limit:</strong> {test.time_limit} minút
            </Typography>
            <Typography variant="body2">
              <strong>Potrebný minimálny výsledok testu:</strong> {test.passing_score}%
            </Typography>
            <Typography variant="body2">
              <strong>Maximálny počet pokusov:</strong> {test.max_attempts}
            </Typography>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            Po spustení testu bude časovač spustený okamžite. Uistite sa že máte stabilné pripojenie
            na internet a dostatok času na ukončenie testu.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">
          Zrušiť
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Spustiť Test
        </Button>
      </DialogActions>
    </Dialog>
  );
};

StartTestConfirmationModal.propTypes = {
  test: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default StartTestConfirmationModal;
