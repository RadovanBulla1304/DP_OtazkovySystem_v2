import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Tooltip
} from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const DEFAULT_ANSWERS = ['', '', '', ''];

const AddQuestionModal = () => {
  const [open, setOpen] = React.useState(false);
  const [answers, setAnswers] = React.useState(DEFAULT_ANSWERS);
  const [correctIndex, setCorrectIndex] = React.useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      question: '',
      answers: DEFAULT_ANSWERS,
      correct: 0
    }
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
    setAnswers(DEFAULT_ANSWERS);
    setCorrectIndex(0);
  };

  const onSubmit = async (data) => {
    // Here you would send data to your API
    toast.success('Otázka bola úspešne pridaná');
    handleClose();
  };

  const handleAnswerChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleRadioChange = (event) => {
    setCorrectIndex(Number(event.target.value));
  };

  return (
    <>
      <Tooltip title="Pridať otázku" key={'addQuestion'}>
        <IconButton color="primary" onClick={handleClickOpen}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        component="form"
        onSubmit={handleSubmit((formData) =>
          onSubmit({
            ...formData,
            answers,
            correct: correctIndex
          })
        )}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 0, fontWeight: 600 }}>Pridaj otázku</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mx: 'auto',
            minWidth: { md: '30rem', xs: '90vw' }
          }}
        >
          <TextField
            label="Znenie otázky"
            variant="outlined"
            multiline
            minRows={3}
            {...register('question', { required: 'Pole je povinné' })}
            error={!!errors.question}
            helperText={errors.question?.message}
            fullWidth
            sx={{
              bgcolor: '#fff',
              borderRadius: 2
            }}
          />

          <RadioGroup
            name="correct"
            value={correctIndex}
            onChange={handleRadioChange}
            sx={{
              flexDirection: 'column',
              gap: 2
            }}
          >
            {answers.map((answer, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Radio value={idx} checked={correctIndex === idx} sx={{ p: 1 }} />
                <TextField
                  label={`Odpoveď ${idx + 1}`}
                  variant="outlined"
                  value={answer}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  fullWidth
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 2
                  }}
                  required
                />
              </Box>
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="error" variant="outlined">
            Zruš
          </Button>
          <Button type="submit" variant="contained">
            Pridaj
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddQuestionModal;
