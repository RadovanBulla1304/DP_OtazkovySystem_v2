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
      PaperProps={{
        sx: {
          mx: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' }
        }
      }}
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
      <DialogActions
        disableSpacing
        sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isUnassigning}
          color="error"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Zrušiť
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isUnassigning}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
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
