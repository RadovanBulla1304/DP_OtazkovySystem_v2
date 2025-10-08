import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const RespondToValidationModal = ({
  open = false,
  question = null,
  onClose = () => {},
  onSubmit = () => {}
}) => {
  const [agreed, setAgreed] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!open) {
      setAgreed(false);
      setComment('');
    }
  }, [open]);

  if (!question) return null;

  // Extract validation info from question
  const isValid = question.validated === true;
  const validationComment = question.validation_comment || '';
  const validatedAt = question.validated_at
    ? new Date(question.validated_at).toLocaleDateString()
    : '';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Odpoveď na validáciu otázky</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Vaša otázka:
          </Typography>
          <Typography sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            {question.text}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={isValid ? 'Validná' : 'Nevalidná'}
              color={isValid ? 'success' : 'error'}
              variant="outlined"
            />
            {validatedAt && (
              <Chip label={`Validované: ${validatedAt}`} variant="outlined" size="small" />
            )}
          </Box>

          {validationComment && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Komentár validátora:
              </Typography>
              <Typography
                sx={{
                  p: 2,
                  bgcolor: 'info.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'info.200'
                }}
              >
                {validationComment}
              </Typography>
            </Box>
          )}
        </Box>

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Súhlasíte s validáciou?</FormLabel>
          <FormControlLabel
            control={
              <Switch
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                color="primary"
              />
            }
            label={agreed ? 'Súhlasím' : 'Nesúhlasím'}
          />
        </FormControl>

        <TextField
          label="Váš komentár (voliteľný)"
          fullWidth
          multiline
          minRows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Napíšte svoj komentár k validácii..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Zrušiť
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (onSubmit && question && question._id) {
              onSubmit(question._id, { agreed, comment });
            }
            onClose();
          }}
        >
          Odoslať odpoveď
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RespondToValidationModal;

RespondToValidationModal.propTypes = {
  open: PropTypes.bool,
  question: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    text: PropTypes.string,
    validated: PropTypes.bool,
    validation_comment: PropTypes.string,
    validated_by: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    validated_at: PropTypes.string
  }),
  onClose: PropTypes.func,
  onSubmit: PropTypes.func
};
