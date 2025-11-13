import { useGetTestAttemptByIdQuery } from '@app/redux/api';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const TestResults = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetTestAttemptByIdQuery(attemptId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error">Chyba načítania výsledkov testu</Typography>
        <Button variant="contained" onClick={() => navigate('/tests')} sx={{ mt: 2 }}>
          Naspäť na Testy
        </Button>
      </Box>
    );
  }

  const testAttempt = data.data;
  const test = testAttempt.test;

  const getAnswerText = (question, answerKey) => {
    if (!answerKey) return 'No answer';
    return question.options[answerKey] || 'Unknown';
  };

  return (
    <Box p={3} maxWidth="1200px" margin="0 auto">
      {/* Header with Score */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {test.title}
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" gap={3} mt={2}>
          <Box>
            <Typography variant="h2" color={testAttempt.passed ? 'success.main' : 'error.main'}>
              {testAttempt.score}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Výsledok
            </Typography>
          </Box>
          <Box>
            <Chip
              label={testAttempt.passed ? 'ÚSPEŠNÝ' : 'NEÚSPEŠNÝ'}
              color={testAttempt.passed ? 'success' : 'error'}
              size="large"
              sx={{ fontSize: '1.2rem', py: 3 }}
            />
          </Box>
          <Box>
            <Typography variant="h3">
              {testAttempt.questions.filter((q) => q.is_correct).length}/
              {testAttempt.questions.length}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Správne odpovede
            </Typography>
          </Box>
          <Box>
            <Typography variant="h3" color="primary">
              {Math.round((testAttempt.score / 100) * test.max_points * 100) / 100}/
              {test.max_points}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Bodov získaných
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Minimálny požadovaný počet bodov: {test.passing_score}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Odovzdané: {new Date(testAttempt.submittedAt).toLocaleString()}
        </Typography>
      </Paper>

      {/* Questions Review */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Prehľad Otázok
      </Typography>

      {/* Card View (like test taking) */}
      <Box mb={4}>
        {testAttempt.questions.map((questionItem, index) => {
          const question = questionItem.question;
          const isCorrect = questionItem.is_correct;
          const selectedAnswer = questionItem.selected_answer;
          const correctAnswer = question.correct;

          return (
            <Card
              key={question._id}
              sx={{
                mb: 2,
                border: 3,
                borderColor: isCorrect ? 'success.main' : 'error.main'
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Otázka {index + 1} z {testAttempt.questions.length}
                  </Typography>
                  {isCorrect ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Správne"
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      icon={<CancelIcon />}
                      label="Nesprávne"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  {question.text || question.question_text}
                </Typography>

                <Box sx={{ pl: 2 }}>
                  {['a', 'b', 'c', 'd'].map((key) => {
                    if (!question.options[key]) return null;

                    const isUserAnswer = selectedAnswer === key;
                    const isCorrectAnswer = correctAnswer === key;

                    let bgcolor = 'transparent';
                    let borderColor = 'divider';
                    let fontWeight = 'normal';

                    if (isCorrectAnswer) {
                      bgcolor = 'success.light';
                      borderColor = 'success.main';
                      fontWeight = 'bold';
                    } else if (isUserAnswer && !isCorrect) {
                      bgcolor = 'error.light';
                      borderColor = 'error.main';
                      fontWeight = 'bold';
                    }

                    return (
                      <Box
                        key={key}
                        sx={{
                          border: 2,
                          borderColor,
                          bgcolor,
                          borderRadius: 1,
                          p: 1.5,
                          mb: 1,
                          position: 'relative'
                        }}
                      >
                        <Typography sx={{ fontWeight }}>
                          {key.toUpperCase()}. {question.options[key]}
                          {isUserAnswer && ' (Vaša odpoveď)'}
                          {isCorrectAnswer && ' ✓ (Správna odpoveď)'}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>#</strong>
              </TableCell>
              <TableCell>
                <strong>Otázka</strong>
              </TableCell>
              <TableCell>
                <strong>Vaša odpoveď</strong>
              </TableCell>
              <TableCell>
                <strong>Správna odpoveď</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Výsledok</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testAttempt.questions.map((questionItem, index) => {
              const question = questionItem.question;
              const isCorrect = questionItem.is_correct;

              return (
                <TableRow
                  key={question._id}
                  sx={{
                    bgcolor: isCorrect ? 'success.light' : 'error.light',
                    '&:hover': { opacity: 0.8 }
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    {question.text || question.question_text}
                  </TableCell>
                  <TableCell>
                    {questionItem.selected_answer
                      ? `${questionItem.selected_answer.toUpperCase()}. ${getAnswerText(question, questionItem.selected_answer)}`
                      : 'Žiadna odpoveď'}
                  </TableCell>
                  <TableCell>
                    {question.correct
                      ? `${question.correct.toUpperCase()}. ${getAnswerText(question, question.correct)}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    {isCorrect ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Buttons */}
      <Box display="flex" justifyContent="center" gap={2} mb={4}>
        <Button variant="contained" onClick={() => navigate('/tests')}>
          Naspäť na Testy
        </Button>
        {testAttempt.test.max_attempts > 1 && (
          <Button variant="outlined" onClick={() => navigate(`/test/${test._id}/take`)}>
            Skúsiť znova
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TestResults;
