import * as authService from '@app/pages/auth/authService';
import { useCreateQuestionRatingMutation } from '@app/redux/api'; // <-- create this mutation in your API slice
import StarIcon from '@mui/icons-material/Star';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Rating,
  TextField,
  Tooltip
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const RateQuestionModal = ({ questionId, questionCreatorId, disabled = false }) => {
  const [open, setOpen] = React.useState(false);
  const auth = authService.getUserFromStorage();
  const [createQuestionRating, { isLoading }] = useCreateQuestionRatingMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      rating: 3,
      comment: ''
    }
  });

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = async (data) => {
    const payload = {
      question: questionId,
      questionCreator: questionCreatorId,
      ratedBy: auth.id,
      rating: data.rating,
      comment: data.comment
    };

    try {
      await createQuestionRating(payload).unwrap();
      toast.success('Hodnotenie bolo uložené');
      handleClose();
    } catch (err) {
      toast.error('Chyba pri hodnotení otázky', err?.data?.message || 'Skúste to neskôr');
    }
  };

  return (
    <>
      <Tooltip title="Ohodnoť otázku">
        <span>
          <IconButton color="primary" onClick={handleClickOpen} disabled={disabled}>
            <StarIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 0, fontWeight: 600, marginBottom: 2 }}>Ohodnoť otázku</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mx: 'auto',
            minWidth: { md: '25rem', xs: '90vw' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              name="rating"
              value={watch('rating')}
              onChange={(_, value) => setValue('rating', value)}
              size="large"
              max={5}
            />
            <span>{watch('rating') || 0}/5</span>
          </Box>
          <TextField
            label="Komentár"
            variant="outlined"
            multiline
            minRows={2}
            {...register('comment', { required: 'Komentár je povinný' })}
            error={!!errors.comment}
            helperText={errors.comment?.message}
            fullWidth
            sx={{
              bgcolor: '#fff',
              borderRadius: 2
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="error" variant="outlined">
            Zruš
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            Ohodnoť
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

RateQuestionModal.propTypes = {
  questionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  questionCreatorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  disabled: PropTypes.bool
};

export default RateQuestionModal;
