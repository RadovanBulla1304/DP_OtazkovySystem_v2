import { useDeleteTestAttemptMutation, useGetTestStatisticsQuery } from '@app/redux/api';
import { Cancel as CancelIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
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
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';

const TestStatisticsModal = ({ testId, open, onClose }) => {
  const [deleteAttemptId, setDeleteAttemptId] = useState(null);

  const {
    data: statsData,
    isLoading,
    error,
    refetch
  } = useGetTestStatisticsQuery(testId, {
    skip: !open || !testId
  });

  const [deleteTestAttempt, { isLoading: isDeleting }] = useDeleteTestAttemptMutation();

  const stats = statsData?.data;

  const handleDeleteAttempt = async (attemptId) => {
    try {
      await deleteTestAttempt(attemptId).unwrap();
      toast.success('Pokus o test bol úspešne vymazaný');
      setDeleteAttemptId(null);
      refetch(); // Refresh statistics after deletion
    } catch (error) {
      console.error('Error deleting test attempt:', error);
      toast.error('Chyba pri mazaní pokusu o test');
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DialogTitle sx={{ p: 0, fontWeight: 600 }}>Štatistiky testu</DialogTitle>
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
                <Paper variant="outlined" sx={{ mb: 3, height: 400 }}>
                  <DataGrid
                    rows={stats.mostWrongQuestions.map((q, idx) => ({
                      id: idx,
                      question: q.question?.text || q.question?.question_text || 'N/A',
                      totalAttempts: q.totalAttempts,
                      wrongAttempts: q.wrongAttempts,
                      wrongRate: Math.round(q.wrongRate)
                    }))}
                    columns={[
                      {
                        field: 'question',
                        headerName: 'Otázky',
                        flex: 2,
                        minWidth: 200
                      },
                      {
                        field: 'totalAttempts',
                        headerName: 'Počet pokusov',
                        flex: 1,
                        align: 'center',
                        headerAlign: 'center',
                        minWidth: 120
                      },
                      {
                        field: 'wrongAttempts',
                        headerName: 'Počet neúspešných pokusov',
                        flex: 1,
                        align: 'center',
                        headerAlign: 'center',
                        minWidth: 180
                      },
                      {
                        field: 'wrongRate',
                        headerName: 'Neúspešnosť',
                        flex: 1,
                        align: 'center',
                        headerAlign: 'center',
                        minWidth: 120,
                        renderCell: (params) => (
                          <Chip
                            label={`${params.value}%`}
                            color={
                              params.value > 70
                                ? 'error'
                                : params.value > 40
                                  ? 'warning'
                                  : 'default'
                            }
                            size="small"
                          />
                        )
                      }
                    ]}
                    pageSizeOptions={[1, 5, 10, 20]}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 5 }
                      },
                      density: 'compact'
                    }}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true } }}
                    disableRowSelectionOnClick
                  />
                </Paper>
              </>
            )}

            {/* User Attempts Table */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Výsledky testov
            </Typography>
            {stats.userAttempts.length === 0 ? (
              <Alert severity="info">žiadne hotové testy.</Alert>
            ) : (
              <Paper variant="outlined" sx={{ height: 500 }}>
                <DataGrid
                  rows={stats.userAttempts.map((attempt) => ({
                    id: attempt._id,
                    userName: attempt.user.name,
                    userEmail: attempt.user.email,
                    score: attempt.score,
                    correctAnswers: attempt.correctAnswers,
                    totalQuestions: attempt.totalQuestions,
                    passed: attempt.passed,
                    totalTime_spent: attempt.totalTime_spent || 0,
                    submittedAt: attempt.submittedAt
                  }))}
                  columns={[
                    {
                      field: 'userName',
                      headerName: 'Študent',
                      flex: 1.5,
                      minWidth: 150,
                      renderCell: (params) => (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            height: '100%',
                            py: 1
                          }}
                        >
                          <Typography variant="body2">{params.value}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {params.row.userEmail}
                          </Typography>
                        </Box>
                      )
                    },
                    {
                      field: 'score',
                      headerName: 'Výsledok',
                      flex: 1,
                      align: 'center',
                      headerAlign: 'center',
                      minWidth: 100,
                      renderCell: (params) => (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                          }}
                        >
                          <Typography
                            variant="h6"
                            color={params.row.passed ? 'success.main' : 'error.main'}
                          >
                            {params.value}%
                          </Typography>
                        </Box>
                      )
                    },
                    {
                      field: 'correctAnswers',
                      headerName: 'Počet správnych odpovedí',
                      flex: 1,
                      align: 'center',
                      headerAlign: 'center',
                      minWidth: 180,
                      valueGetter: (value, row) => `${row.correctAnswers}/${row.totalQuestions}`
                    },
                    {
                      field: 'passed',
                      headerName: 'Status',
                      flex: 1,
                      align: 'center',
                      headerAlign: 'center',
                      minWidth: 120,
                      renderCell: (params) => (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                          }}
                        >
                          <Chip
                            label={params.value ? 'ÚSPEŠNE' : 'NEÚSPEŠNE'}
                            color={params.value ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                      )
                    },
                    {
                      field: 'totalTime_spent',
                      headerName: 'Čas testu',
                      flex: 1,
                      align: 'center',
                      headerAlign: 'center',
                      minWidth: 100,
                      valueGetter: (value) => `${Math.floor(value / 60)}m ${value % 60}s`
                    },
                    {
                      field: 'submittedAt',
                      headerName: 'Odovzdané',
                      flex: 1.5,
                      align: 'center',
                      headerAlign: 'center',
                      minWidth: 180,
                      valueGetter: (value) => format(new Date(value), 'PPp')
                    },
                    {
                      field: 'actions',
                      headerName: 'Vymazať pokus',
                      flex: 1,
                      align: 'center',
                      headerAlign: 'center',
                      minWidth: 120,
                      sortable: false,
                      filterable: false,
                      renderCell: (params) => (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                          }}
                        >
                          <Tooltip title="Vymazať pokus o test">
                            <IconButton
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteAttemptId(params.row.id);
                              }}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )
                    }
                  ]}
                  pageSizeOptions={[1, 5, 10, 20, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10 }
                    },
                    density: 'compact'
                  }}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true } }}
                  disableRowSelectionOnClick
                  getRowHeight={() => 'auto'}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                />
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">
          Zrušiť
        </Button>
      </DialogActions>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteAttemptId}
        onClose={() => setDeleteAttemptId(null)}
        aria-labelledby="delete-attempt-dialog-title"
      >
        <DialogTitle id="delete-attempt-dialog-title" sx={{ fontWeight: 600 }}>
          Vymazať pokus o test?
        </DialogTitle>
        <DialogContent>
          <Typography>Naozaj chcete vymazať tento pokus o test? Táto akcia je nevratná.</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteAttemptId(null)}
            variant="outlined"
            disabled={isDeleting}
            color="error"
          >
            Zrušiť
          </Button>
          <Button
            onClick={() => handleDeleteAttempt(deleteAttemptId)}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Mazanie...' : 'Vymazať'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

TestStatisticsModal.propTypes = {
  testId: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default TestStatisticsModal;
