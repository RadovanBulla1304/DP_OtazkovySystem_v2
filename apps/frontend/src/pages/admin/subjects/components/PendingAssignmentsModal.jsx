import {
  useDeleteAllPendingAssignmentsMutation,
  useDeletePendingAssignmentMutation,
  useGetPendingAssignmentsQuery
} from '@app/redux/api';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
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
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';

const PendingAssignmentsModal = ({ open, onClose, subjectId }) => {
  const {
    data: pendingAssignments = [],
    isLoading,
    isFetching
  } = useGetPendingAssignmentsQuery(subjectId, {
    skip: !open || !subjectId
  });

  const [deletePendingAssignment, { isLoading: isDeleting }] =
    useDeletePendingAssignmentMutation();
  const [deleteAllPendingAssignments, { isLoading: isDeletingAll }] =
    useDeleteAllPendingAssignmentsMutation();

  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const handleDeleteOne = async (id, studentNumber) => {
    try {
      await deletePendingAssignment(id).unwrap();
      toast.success(`Čakajúce priradenie pre študenta ${studentNumber} bolo zmazané`);
    } catch (error) {
      console.error('Error deleting pending assignment:', error);
      toast.error('Chyba pri mazaní čakajúceho priradenia');
    }
  };

  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllPendingAssignments(subjectId).unwrap();
      toast.success(result.message || 'Všetky čakajúce priradenia boli zmazané');
      setConfirmDeleteAll(false);
    } catch (error) {
      console.error('Error deleting all pending assignments:', error);
      toast.error('Chyba pri mazaní čakajúcich priradení');
    }
  };

  const handleClose = () => {
    setConfirmDeleteAll(false);
    onClose();
  };

  const isAnyLoading = isDeleting || isDeletingAll;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <HourglassEmptyIcon color="warning" />
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              Čakajúce priradenia študentov
            </Typography>
            {pendingAssignments.length > 0 && (
              <Chip
                label={pendingAssignments.length}
                color="warning"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading || isFetching ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : pendingAssignments.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            Žiadne čakajúce priradenia pre tento predmet. Čakajúce priradenia sa vytvárajú pri
            importe CSV, keď študent ešte nie je registrovaný v systéme.
          </Alert>
        ) : (
          <Stack spacing={2}>
            <Alert severity="info">
              Títo študenti ešte nie sú registrovaní v systéme. Po registrácii a potvrdení emailu
              budú <strong>automaticky priradení</strong> k tomuto predmetu.
            </Alert>

            {confirmDeleteAll && (
              <Alert
                severity="warning"
                action={
                  <Box display="flex" gap={1}>
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => setConfirmDeleteAll(false)}
                    >
                      Nie
                    </Button>
                    <Button
                      color="error"
                      size="small"
                      variant="contained"
                      onClick={handleDeleteAll}
                      disabled={isDeletingAll}
                    >
                      {isDeletingAll ? 'Mažem...' : 'Áno, zmazať všetky'}
                    </Button>
                  </Box>
                }
              >
                Naozaj chcete zmazať všetky čakajúce priradenia?
              </Alert>
            )}

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Študentské číslo</TableCell>
                    <TableCell>Priezvisko</TableCell>
                    <TableCell>Meno</TableCell>
                    <TableCell>Skupina</TableCell>
                    <TableCell>Platnosť do</TableCell>
                    <TableCell align="right">Akcie</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingAssignments.map((record, idx) => (
                    <TableRow key={record._id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <strong>{record.studentNumber}</strong>
                      </TableCell>
                      <TableCell>{record.csvSurname || '—'}</TableCell>
                      <TableCell>{record.csvName || '—'}</TableCell>
                      <TableCell>{record.csvGroup || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={dayjs(record.expiresAt).format('DD.MM.YYYY')}
                          size="small"
                          color={
                            dayjs(record.expiresAt).diff(dayjs(), 'month') < 1
                              ? 'error'
                              : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Zmazať čakajúce priradenie">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteOne(record._id, record.studentNumber)}
                            disabled={isAnyLoading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Zavrieť
        </Button>
        {pendingAssignments.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={() => setConfirmDeleteAll(true)}
            disabled={isAnyLoading || confirmDeleteAll}
          >
            Zmazať všetky
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

PendingAssignmentsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subjectId: PropTypes.string.isRequired
};

export default PendingAssignmentsModal;
