import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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
import { useState } from 'react';

const TeacherValidationModal = ({ open, onClose, question, onSubmit, isSubmitting = false }) => {
  const [isValidated, setIsValidated] = useState(false);
  const [validationComment, setValidationComment] = useState('');

  // Initialize state when question changes
  useState(() => {
    if (question) {
      setIsValidated(question.validated_by_teacher || false);
      setValidationComment(question.validated_by_teacher_comment || '');
    }
  }, [question]);

  const handleSubmit = () => {
    if (!validationComment.trim()) {
      return;
    }

    onSubmit({
      questionId: question._id,
      validated_by_teacher: isValidated,
      validated_by_teacher_comment: validationComment.trim()
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form after a short delay to avoid visual glitch
    setTimeout(() => {
      setIsValidated(false);
      setValidationComment('');
    }, 300);
  };

  if (!question) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">Validácia otázky učiteľom</Typography>
          {question.validated_by_teacher && (
            <Chip label="Už validované" color="success" size="small" />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Otázka:
          </Typography>

          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
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

            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              <strong>Správna odpoveď:</strong> {question.correct.toUpperCase()}
            </Typography>
          </Paper>

          {/* Question metadata */}
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'info.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Informácie o otázke:
            </Typography>

            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Modul:</strong> {question.modul?.name || 'N/A'}
            </Typography>

            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Vytvoril:</strong>{' '}
              {question.createdBy
                ? `${question.createdBy.name} ${question.createdBy.surname}`
                : 'N/A'}
            </Typography>

            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Vytvorené:</strong> {format(new Date(question.createdAt), 'PPp')}
            </Typography>

            {question.rating_stats && (
              <Typography variant="body2" color="textSecondary">
                <strong>Hodnotenie:</strong>{' '}
                {question.rating_stats.total_ratings > 0
                  ? `${question.rating_stats.average_rating.toFixed(1)} (${
                      question.rating_stats.total_ratings
                    } hodnotení)`
                  : 'Zatiaľ žiadne hodnotenia'}
              </Typography>
            )}
          </Paper>

          {/* Current validation status */}
          {question.validated_by_teacher && (
            <Alert severity="info" sx={{ mb: 3 }}>
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

          {/* Validation form */}
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
            rows={4}
            label="Komentár k validácii (povinný)"
            value={validationComment}
            onChange={(e) => setValidationComment(e.target.value)}
            required
            error={!validationComment.trim()}
            helperText={
              !validationComment.trim()
                ? 'Prosím, zadajte komentár vysvetľujúci vašu validáciu'
                : 'Vysvetlite, prečo je otázka validná/nevalidná, alebo navrhnite úpravy'
            }
            placeholder={
              isValidated
                ? 'Napríklad: Otázka je jasne formulovaná, správna odpoveď je jednoznačná...'
                : 'Napríklad: Otázka je nejasná, možnosti odpovedí sú mätúce, správna odpoveď je sporná...'
            }
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>
          Zrušiť
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!validationComment.trim() || isSubmitting}
          color={isValidated ? 'success' : 'warning'}
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
      </DialogActions>
    </Dialog>
  );
};

TeacherValidationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  question: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default TeacherValidationModal;
