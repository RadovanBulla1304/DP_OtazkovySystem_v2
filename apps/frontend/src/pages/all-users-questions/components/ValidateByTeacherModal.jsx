import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const ValidateByTeacherModal = ({ open, onClose, question, onSubmit, isSubmitting }) => {
  const [isValidated, setIsValidated] = useState(true);
  const [validationComment, setValidationComment] = useState('');

  // Reset state when modal opens with a new question
  useEffect(() => {
    if (open && question) {
      // Default to true (valid) - only use existing value if question has a comment (was actually validated)
      setIsValidated(question.validated_by_teacher_comment ? question.validated_by_teacher : true);
      setValidationComment(question.validated_by_teacher_comment || '');
    }
  }, [open, question]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setIsValidated(true);
      setValidationComment('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!question || !validationComment.trim()) {
      return;
    }

    onSubmit({
      questionId: question._id,
      validated_by_teacher: isValidated,
      validated_by_teacher_comment: validationComment.trim()
    });
  };

  if (!question) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <DialogTitle sx={{ fontWeight: 600, p: 0 }}>Validácia otázky učiteľom</DialogTitle>
          {question.validated_by_teacher && (
            <Chip label="Validované učiteľom" color="primary" size="small" />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          {/* Left Column - Question Display */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Otázka:
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {question.text}
                </Typography>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Možnosti odpovedí:
                </Typography>
                <List dense>
                  {Object.entries(question.options).map(([key, value]) => (
                    <ListItem key={key} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Chip
                              label={key.toUpperCase()}
                              size="small"
                              color={question.correct === key ? 'success' : 'default'}
                              sx={{ mr: 1, minWidth: 32 }}
                            />
                            <Typography
                              sx={{
                                fontWeight: question.correct === key ? 'bold' : 'normal'
                              }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Current validation status */}
              {question.validated_by_teacher && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Aktuálny stav:</strong> Otázka je už validovaná učiteľom
                    {question.validated_by_teacher_at && (
                      <> dňa {format(new Date(question.validated_by_teacher_at), 'PPp')}</>
                    )}
                  </Typography>
                  {question.validated_by_teacher_comment && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Aktuálny komentár:</strong> {question.validated_by_teacher_comment}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          </Grid>

          {/* Right Column - Validation Controls */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Validácia:
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isValidated}
                      onChange={(e) => setIsValidated(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {isValidated ? 'Otázka je validná' : 'Otázka nie je validná'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {isValidated
                          ? 'Otázka spĺňa kvalitatívne štandardy a môže byť použitá v testoch'
                          : 'Otázka má nedostatky a potrebuje úpravu pred použitím'}
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={7}
                label="Komentár k validácii (povinný)"
                value={validationComment}
                onChange={(e) => setValidationComment(e.target.value)}
                required
                helperText={
                  validationComment.trim()
                    ? 'Vysvetlite, prečo je otázka validná/nevalidná'
                    : 'Prosím, zadajte komentár vysvetľujúci vašu validáciu'
                }
                placeholder={
                  isValidated
                    ? 'Napríklad: Otázka je jasne formulovaná, správna odpoveď je jednoznačná...'
                    : 'Napríklad: Otázka je nejasná, možnosti odpovedí sú mätúce, správna odpoveď je sporná...'
                }
                sx={{ flexGrow: 1 }}
              />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                <Button onClick={onClose} disabled={isSubmitting} variant="outlined" color="error">
                  Zrušiť
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={!validationComment.trim() || isSubmitting}
                  color={isValidated ? 'primary' : 'warning'}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Ukladám...
                    </>
                  ) : (
                    `${isValidated ? 'Validovať' : 'Označiť ako nevalidnú'} otázku`
                  )}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

ValidateByTeacherModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  question: PropTypes.shape({
    _id: PropTypes.string,
    text: PropTypes.string,
    options: PropTypes.object,
    correct: PropTypes.string,
    validated_by_teacher: PropTypes.bool,
    validated_by_teacher_comment: PropTypes.string,
    validated_by_teacher_at: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default ValidateByTeacherModal;
