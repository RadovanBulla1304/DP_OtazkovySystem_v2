import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const QuestionCard = ({ question, isTeacher, onValidateClick }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Question Text */}
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', mb: 2 }}>
        {question.text}
      </Typography>

      {/* Answer Options */}
      <Box sx={{ mb: 2, flexGrow: 1 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.875rem' }}>
          Možnosti odpovedí:
        </Typography>
        <List dense sx={{ py: 0 }}>
          {Object.entries(question.options).map(([key, value]) => (
            <ListItem key={key} sx={{ py: 0.25, px: 0 }}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Chip
                      label={key.toUpperCase()}
                      size="small"
                      color={question.correct === key ? 'success' : 'default'}
                      sx={{ mr: 1, minWidth: 28, height: 20, fontSize: '0.7rem' }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: question.correct === key ? 'bold' : 'normal',
                        fontSize: '0.875rem'
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
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Details Section */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'grey.50',
          borderRadius: 1,
          mb: 1
        }}
      >
        <Typography variant="caption" display="block" color="textSecondary" gutterBottom>
          <strong>Modul:</strong> {question.modul?.title || question.modul?.name || 'N/A'}
        </Typography>

        <Typography variant="caption" display="block" color="textSecondary" gutterBottom>
          <strong>Vytvoril:</strong>{' '}
          {question.createdBy?.name && question.createdBy?.surname
            ? `${question.createdBy.name} ${question.createdBy.surname}`
            : question.createdBy?.name || question.createdBy?.surname || 'N/A'}
        </Typography>

        <Typography variant="caption" display="block" color="textSecondary" gutterBottom>
          <strong>Vytvorené:</strong> {format(new Date(question.createdAt), 'PP')}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label="Validované"
            color="success"
            size="small"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
          {question.validated_by_teacher && (
            <Chip
              label="Validované učiteľom"
              color="primary"
              size="small"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </Box>

      {/* Teacher validation button */}
      {isTeacher && (
        <Box sx={{ mt: 'auto' }}>
          <Button
            variant={question.validated_by_teacher ? 'outlined' : 'contained'}
            color={question.validated_by_teacher ? 'info' : 'primary'}
            size="small"
            onClick={() => onValidateClick(question)}
            fullWidth
            sx={{ fontSize: '0.75rem' }}
          >
            {question.validated_by_teacher ? 'Upraviť validáciu' : 'Validovať otázku'}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

QuestionCard.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
    correct: PropTypes.string.isRequired,
    modul: PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      name: PropTypes.string
    }),
    createdBy: PropTypes.shape({
      name: PropTypes.string,
      surname: PropTypes.string
    }),
    createdAt: PropTypes.string.isRequired,
    validated_by_teacher: PropTypes.bool
  }).isRequired,
  isTeacher: PropTypes.bool.isRequired,
  onValidateClick: PropTypes.func.isRequired
};

export default QuestionCard;
