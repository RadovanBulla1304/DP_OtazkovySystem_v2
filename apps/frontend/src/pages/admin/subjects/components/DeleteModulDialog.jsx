import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import PropTypes from 'prop-types';

const DeleteModulDialog = ({ open, onClose, onConfirm, modul, isDeleting }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-modul-dialog-title"
      aria-describedby="delete-modul-dialog-description"
    >
      <DialogTitle id="delete-modul-dialog-title">Vymazať modul?</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-modul-dialog-description">
          Naozaj chcete odstrániť modul <strong>{modul?.title}</strong>? Táto akcia je nevratná.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Zrušiť
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isDeleting}>
          {isDeleting ? 'Mazanie...' : 'Vymazať'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DeleteModulDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  modul: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string
  }),
  isDeleting: PropTypes.bool
};

export default DeleteModulDialog;
