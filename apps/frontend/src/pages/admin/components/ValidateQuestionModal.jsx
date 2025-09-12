import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const ValidateQuestionModal = ({ open, question, onClose, onSubmit }) => {
  const [valid, setValid] = useState('valid');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!open) {
      setValid('valid');
      setComment('');
    }
  }, [open]);

  if (!question) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Overiť otázku</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2, fontWeight: 600 }}>{question.text}</Typography>
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Validita</FormLabel>
          <RadioGroup value={valid} onChange={(e) => setValid(e.target.value)} row>
            <FormControlLabel value="valid" control={<Radio />} label="Validná" />
            <FormControlLabel value="invalid" control={<Radio />} label="Nevalidná" />
          </RadioGroup>
        </FormControl>

        <TextField
          label="Komentár"
          fullWidth
          multiline
          minRows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušiť</Button>
        <Button
          variant="contained"
          onClick={() => {
            if (onSubmit && question && question._id) {
              onSubmit(question._id, { valid: valid === 'valid', comment });
            }
            onClose();
          }}
        >
          Odoslať
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidateQuestionModal;

ValidateQuestionModal.propTypes = {
  open: PropTypes.bool,
  question: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    text: PropTypes.string,
    correct: PropTypes.string
  }),
  onClose: PropTypes.func,
  onSubmit: PropTypes.func
};

ValidateQuestionModal.defaultProps = {
  open: false,
  question: null,
  onClose: () => {},
  onSubmit: () => {}
};
