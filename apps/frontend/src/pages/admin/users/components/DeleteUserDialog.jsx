import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';

const DeleteUserDialog = ({ open, user, isDeleting, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-user-dialog-title"
      aria-describedby="delete-user-dialog-description"
      PaperProps={{
        sx: {
          mx: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle id="delete-user-dialog-title" sx={{ fontWeight: 600 }}>
        Vymazať používateľa?
      </DialogTitle>
      <DialogContent>
        <Typography id="delete-user-dialog-description">
          Naozaj chcete odstrániť používateľa{' '}
          <strong>
            {user?.name} {user?.surname}
          </strong>
          ? Táto akcia je nevratná.
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

DeleteUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    surname: PropTypes.string
  }),
  isDeleting: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default DeleteUserDialog;

