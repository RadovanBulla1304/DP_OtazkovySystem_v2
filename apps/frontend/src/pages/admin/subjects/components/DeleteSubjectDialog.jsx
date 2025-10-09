import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';

const DeleteSubjectDialog = ({ open, onClose, onConfirm, subject, isDeleting }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-subject-dialog-title"
      aria-describedby="delete-subject-dialog-description"
    >
      <DialogTitle id="delete-subject-dialog-title">Vymazať predmet?</DialogTitle>
      <DialogContent>
        <Typography id="delete-subject-dialog-description">
          Naozaj chcete odstrániť predmet <strong>{subject?.name}</strong> a všetky jeho moduly?
          Táto akcia je nevratná.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={isDeleting} color="error">
          Zrušiť
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isDeleting}>
          {isDeleting ? 'Mazanie...' : 'Vymazať'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DeleteSubjectDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  subject: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string
  }),
  isDeleting: PropTypes.bool
};

export default DeleteSubjectDialog;
