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
      PaperProps={{
        sx: {
          mx: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle id="delete-subject-dialog-title" sx={{ fontWeight: 600 }}>
        Vymazať predmet?
      </DialogTitle>
      <DialogContent>
        <Typography id="delete-subject-dialog-description">
          Naozaj chcete odstrániť predmet <strong>{subject?.name}</strong> a všetky jeho moduly?
          Táto akcia je nevratná.
        </Typography>
      </DialogContent>
      <DialogActions
        disableSpacing
        sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isDeleting}
          color="error"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Zrušiť
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
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
