import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';

const UnassignUsersDialog = ({ open, userCount, isUnassigning, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="unassign-users-dialog-title"
      aria-describedby="unassign-users-dialog-description"
    >
      <DialogTitle id="unassign-users-dialog-title" sx={{ fontWeight: 600 }}>
        Odstrániť priradenie študentov?
      </DialogTitle>
      <DialogContent>
        <Typography id="unassign-users-dialog-description">
          Naozaj chcete odstrániť{' '}
          <strong>
            {userCount} {userCount === 1 ? 'študenta' : userCount < 5 ? 'študentov' : 'študentov'}
          </strong>{' '}
          z tohto predmetu? Táto akcia je nevratná.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={isUnassigning} color="error">
          Zrušiť
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isUnassigning}>
          {isUnassigning ? 'Odstraňujem...' : 'Odstrániť'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UnassignUsersDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  userCount: PropTypes.number.isRequired,
  isUnassigning: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default UnassignUsersDialog;
