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
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <DialogTitle>{title}</DialogTitle>
          <Typography>{secondaryText}</Typography>
          <DialogActions>
            <Button onClick={handleClose} color="error" variant="outlined">
              Zruš
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                onAccept();
                handleClose();
              }}
            >
              Potvrd
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
