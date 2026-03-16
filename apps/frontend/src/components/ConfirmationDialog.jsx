import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';

import { useState } from 'react';

const ConfirmationDialog = ({ onAccept, title, secondaryText, children }) => {
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box onClick={handleClickOpen}>{children}</Box>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mx: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        <DialogContent>
          <DialogTitle>{title}</DialogTitle>
          <Typography>{secondaryText}</Typography>
          <DialogActions
            disableSpacing
            sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}
          >
            <Button
              onClick={handleClose}
              color="error"
              variant="outlined"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Zrušiť
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                onAccept();
                handleClose();
              }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Potvrdiť
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

ConfirmationDialog.propTypes = {
  onAccept: PropTypes.func,
  title: PropTypes.string.isRequired,
  secondaryText: PropTypes.string,
  children: PropTypes.object
};

export default ConfirmationDialog;

