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

const ValidateQuestionModal = ({
  open = false,
  question = null,
  onClose = () => {},
  onSubmit = () => {}
}) => {
  const [valid, setValid] = useState('valid');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!open) {
      setValid('valid');
      setComment('');
      return;
    }

    const hasExistingValidation =
      question?.validated_by !== undefined && question?.validated_by !== null;

    if (hasExistingValidation) {
      setValid(question?.validated ? 'valid' : 'invalid');
      setComment(question?.validation_comment || '');
    } else {
      setValid('valid');
      setComment('');
    }
  }, [open, question]);

  if (!question) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          mx: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle>Overiť otázku</DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography sx={{ mb: 2, fontWeight: 600 }}>{question.text}</Typography>
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Validita</FormLabel>
          <RadioGroup
            value={valid}
            onChange={(e) => setValid(e.target.value)}
            row
            sx={{ flexWrap: 'wrap' }}
          >
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
      <DialogActions disableSpacing sx={{ flexWrap: 'wrap', gap: 1, px: { xs: 2, sm: 3 }, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Zrušiť
        </Button>
        <Button
          variant="contained"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
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

