import { useStartTestAttemptMutation, useSubmitTestAttemptMutation } from '@app/redux/api';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [startTestAttempt, { isLoading }] = useStartTestAttemptMutation();
  const [submitTestAttempt, { isLoading: isSubmittingTest }] = useSubmitTestAttemptMutation();

  const [testAttempt, setTestAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const hasStartedRef = useRef(false); // Prevent duplicate API calls

  // Start test attempt on component mount
  useEffect(() => {
    const startTest = async () => {
      // Prevent duplicate calls
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      try {
        const result = await startTestAttempt(testId).unwrap();
        setTestAttempt(result.data);
        // Set initial time in seconds
        setTimeRemaining(result.data.test.time_limit * 60);
      } catch (error) {
        console.error('Error starting test:', error);
        alert(error.data?.message || 'Failed to start test');
        navigate('/tests');
      }
    };

    startTest();
  }, [testId, startTestAttempt, navigate]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitTest = async () => {
    if (isSubmittingTest) return;

    try {
      const submittedAnswers = testAttempt.questions.map((q) => ({
        question: q.question._id,
        selected_answer: answers[q.question._id] || null
      }));

      await submitTestAttempt({
        attemptId: testAttempt._id,
        answers: submittedAnswers
      }).unwrap();

      // Navigate to results page
      navigate(`/test-results/${testAttempt._id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert(error.data?.message || 'Failed to submit test');
    }
  };

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !testAttempt) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const progress =
    ((testAttempt.test.time_limit * 60 - timeRemaining) / (testAttempt.test.time_limit * 60)) * 100;

  return (
    <Box p={3} maxWidth="900px" margin="0 auto">
      {/* Header with timer */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, position: 'sticky', top: 0, zIndex: 10 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h5">{testAttempt.test.title}</Typography>
          <Typography
            variant="h4"
            color={timeRemaining < 60 ? 'error' : 'primary'}
            sx={{ fontWeight: 'bold' }}
          >
            {formatTime(timeRemaining)}
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {Object.keys(answers).length} / {testAttempt.questions.length} questions answered
        </Typography>
      </Paper>

      {/* Questions */}
      <Box>
        {testAttempt.questions.map((questionItem, index) => {
          const question = questionItem.question;
          const options = question.options || {};
          const answerOptions = [
            { key: 'a', text: options.a },
            { key: 'b', text: options.b },
            { key: 'c', text: options.c },
            { key: 'd', text: options.d }
          ].filter((opt) => opt.text); // Filter out undefined options

          return (
            <Card key={question._id} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Question {index + 1} of {testAttempt.questions.length}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  {question.text || question.question_text}
                </Typography>

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={answers[question._id] || ''}
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  >
                    {answerOptions.map((option) => (
                      <FormControlLabel
                        key={`${question._id}-answer-${option.key}`}
                        value={option.key}
                        control={<Radio />}
                        label={option.text}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          ml: 0,
                          pr: 2
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Submit Button */}
      <Box display="flex" justifyContent="center" mt={4} mb={4}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmitTest}
          disabled={isSubmittingTest || Object.keys(answers).length === 0}
        >
          {isSubmittingTest ? 'Submitting...' : 'Submit Test'}
        </Button>
      </Box>

      {Object.keys(answers).length < testAttempt.questions.length && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have not answered all questions. You can still submit, but unanswered questions will
          be marked as incorrect.
        </Alert>
      )}
    </Box>
  );
};

export default TakeTest;
