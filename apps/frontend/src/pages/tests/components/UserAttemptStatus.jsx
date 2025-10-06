import { useGetUserTestAttemptsQuery } from '@app/redux/api';
import { Box, CircularProgress, Typography } from '@mui/material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const UserAttemptStatus = ({ testId }) => {
  const { data: attemptsData, isLoading } = useGetUserTestAttemptsQuery(testId);
  const attempts = attemptsData?.data || [];

  if (isLoading) {
    return (
      <Box mt={2} p={2} textAlign="center">
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (attempts.length === 0) return null;

  const latestAttempt = attempts[0]; // Sorted by submittedAt desc

  return (
    <Box
      mt={2}
      p={2}
      bgcolor={latestAttempt.passed ? 'success.main' : 'error.main'}
      borderRadius={1}
      sx={{ color: 'white' }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" fontWeight="bold" color="inherit">
            {latestAttempt.score}%
          </Typography>
          <Typography variant="body2" color="inherit">
            {latestAttempt.passed ? '✓ ÚSPEŠNE' : '✗ NEÚSPEŠNE'}
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="caption" color="inherit" display="block">
            Pokusy: {attempts.length}
          </Typography>
          <Typography variant="caption" color="inherit" display="block">
            {format(new Date(latestAttempt.submittedAt), 'PPp')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

UserAttemptStatus.propTypes = {
  testId: PropTypes.string.isRequired
};

export default UserAttemptStatus;
