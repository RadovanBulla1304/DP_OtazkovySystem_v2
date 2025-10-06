import { useGetTestStatisticsQuery } from '@app/redux/api';
import { Cancel as CancelIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const TestStatisticsModal = ({ testId, open, onClose }) => {
  const {
    data: statsData,
    isLoading,
    error
  } = useGetTestStatisticsQuery(testId, {
    skip: !open || !testId
  });

  const stats = statsData?.data;

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Štatistiky testu</Typography>
          <IconButton onClick={onClose} size="small">
            <CancelIcon />
          </IconButton>
        </Box>
        {stats?.test && (
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {stats.test.title}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Chyba s načítavaním Štatistiky, prosím skúste znova</Alert>
        ) : !stats ? (
          <Alert severity="info">Žiadne dostupné Štatistiky</Alert>
        ) : (
          <Box>
            {/* Summary Statistics */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Prehľad
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Počet pokusov
                    </Typography>
                    <Typography variant="h4">{stats.summary.totalAttempts}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      od {stats.summary.uniqueUsers} Použivateľov
                      {stats.summary.uniqueUsers !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Priemerný výsledok
                    </Typography>
                    <Typography variant="h4">{stats.summary.averageScore}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Minimálny potrebný počet bodov
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {stats.summary.passRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats.summary.passedCount} úspešne / {stats.summary.failedCount} neúspešne
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Priemerná dlžka trvania testu
                    </Typography>
                    <Typography variant="h4">
                      {Math.floor(stats.summary.averageTime / 60)}m
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats.summary.averageTime % 60}s
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Most Wrong Questions */}
            {stats.mostWrongQuestions.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Otázky s najvačsou neúspešnosťou
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Otázky</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Počet pokusov</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Počet neúspešných pokusov</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Neúspešnosť</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.mostWrongQuestions.map((q, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography variant="body2">
                              {q.question?.text || q.question?.question_text || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{q.totalAttempts}</TableCell>
                          <TableCell align="center">{q.wrongAttempts}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${Math.round(q.wrongRate)}%`}
                              color={
                                q.wrongRate > 70
                                  ? 'error'
                                  : q.wrongRate > 40
                                    ? 'warning'
                                    : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* User Attempts Table */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Výsledky testov
            </Typography>
            {stats.userAttempts.length === 0 ? (
              <Alert severity="info">žiadne hotové testy.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Študent</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Výsledok</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Počet správnych odpovedí</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Status</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Čas testu</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Odovzdané</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.userAttempts.map((attempt) => (
                      <TableRow key={attempt._id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{attempt.user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {attempt.user.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="h6"
                            color={attempt.passed ? 'success.main' : 'error.main'}
                          >
                            {attempt.score}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={attempt.passed ? 'ÚSPEŠNE' : 'NEÚSPEŠNE'}
                            color={attempt.passed ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {Math.floor((attempt.totalTime_spent || 0) / 60)}m{' '}
                          {(attempt.totalTime_spent || 0) % 60}s
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {format(new Date(attempt.submittedAt), 'PPp')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Zavrieť
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TestStatisticsModal.propTypes = {
  testId: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default TestStatisticsModal;
