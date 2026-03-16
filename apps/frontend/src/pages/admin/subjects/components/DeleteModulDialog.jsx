import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';

const DeleteModulDialog = ({ open, onClose, onConfirm, modul, isDeleting }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-modul-dialog-title"
      aria-describedby="delete-modul-dialog-description"
      PaperProps={{
        sx: {
          mx: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle id="delete-modul-dialog-title" sx={{ fontWeight: 600 }}>
        Vymazať modul?
      </DialogTitle>
      <DialogContent>
        <Typography id="delete-modul-dialog-description">
          Naozaj chcete odstrániť modul <strong>{modul?.title}</strong>? Táto akcia je nevratná.
        </Typography>
      </DialogContent>
      <DialogActions
        disableSpacing
        sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}
      >
        <Button
          onClick={onClose}
          disabled={isDeleting}
          color="error"
          variant="outlined"
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
