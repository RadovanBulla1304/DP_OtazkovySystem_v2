import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  useAssignTeacherToSubjectMutation,
  useGetAllTeachersQuery,
  useUnassignTeacherFromSubjectMutation
} from '../../../../redux/api';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  borderRight: `1px solid ${theme.palette.divider}`,
  '&:first-of-type': {
    position: 'sticky',
    left: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 2,
    minWidth: 150,
    maxWidth: 150,
    textAlign: 'left',
    fontWeight: 'bold'
  }
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'center',
  fontWeight: 'bold',
  backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  borderRight: `1px solid ${theme.palette.divider}`,
  minWidth: 150,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  '&:first-of-type': {
    position: 'sticky',
    left: 0,
    zIndex: 3,
    minWidth: 150,
    maxWidth: 150,
    textAlign: 'left'
  }
}));

const BulkAssignTeachers = ({ open, onClose, subjects }) => {
  const [assignments, setAssignments] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: teachers = [], isLoading: loadingTeachers } = useGetAllTeachersQuery();
  const [assignTeacher] = useAssignTeacherToSubjectMutation();
  const [unassignTeacher] = useUnassignTeacherFromSubjectMutation();

  // Initialize assignments based on current subject data
  useEffect(() => {
    if (subjects && teachers.length > 0) {
      const initialAssignments = {};

      teachers.forEach((teacher) => {
        subjects.forEach((subject) => {
          const key = `${teacher._id}-${subject._id}`;
          const assignedTeacherIds =
            subject.assigned_teachers?.map((t) => (typeof t === 'string' ? t : t._id)) || [];
          initialAssignments[key] = assignedTeacherIds.includes(teacher._id);
        });
      });

      setAssignments(initialAssignments);
    }
  }, [subjects, teachers]);

  const handleToggle = (teacherId, subjectId) => {
    const key = `${teacherId}-${subjectId}`;
    setAssignments((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises = [];

      teachers.forEach((teacher) => {
        subjects.forEach((subject) => {
          const key = `${teacher._id}-${subject._id}`;
          const isCurrentlyAssigned = assignments[key];

          const assignedTeacherIds =
            subject.assigned_teachers?.map((t) => (typeof t === 'string' ? t : t._id)) || [];
          const wasAssigned = assignedTeacherIds.includes(teacher._id);

          if (isCurrentlyAssigned && !wasAssigned) {
            // Need to assign
            promises.push(
              assignTeacher({
                subjectId: subject._id,
                teacherId: teacher._id
              }).unwrap()
            );
          } else if (!isCurrentlyAssigned && wasAssigned) {
            // Need to unassign
            promises.push(
              unassignTeacher({
                subjectId: subject._id,
                teacherId: teacher._id
              }).unwrap()
            );
          }
        });
      });

      if (promises.length > 0) {
        await Promise.all(promises);
        toast.success('Priradenia učiteľov boli úspešne aktualizované');
      } else {
        toast.info('Žiadne zmeny na uloženie');
      }

      onClose();
    } catch (error) {
      console.error('Error saving teacher assignments:', error);
      toast.error('Chyba pri ukladaní priradení učiteľov');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (loadingTeachers) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Priradenie učiteľov</DialogTitle>
        <DialogContent>
          <Typography>Žiadne predmety k dispozícii</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Zavrieť</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (teachers.length === 0) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Priradenie učiteľov</DialogTitle>
        <DialogContent>
          <Typography>Žiadni učitelia k dispozícii</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Zavrieť</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Hromadné priradenie učiteľov k predmetom</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Zaškrtnite políčka pre priradenie učiteľov k predmetom. Učitelia sú na vertikálnej osi,
            predmety na horizontálnej osi.
          </Typography>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 500,
            border: 1,
            borderColor: 'divider'
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <StyledHeaderCell>Učiteľ</StyledHeaderCell>
                {subjects.map((subject) => (
                  <StyledHeaderCell key={subject._id}>{subject.name}</StyledHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow
                  key={teacher._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <StyledTableCell>
                    {teacher.name} {teacher.surname}
                  </StyledTableCell>
                  {subjects.map((subject) => {
                    const key = `${teacher._id}-${subject._id}`;
                    return (
                      <StyledTableCell key={subject._id}>
                        <Checkbox
                          checked={assignments[key] || false}
                          onChange={() => handleToggle(teacher._id, subject._id)}
                          disabled={isSaving}
                          size="small"
                        />
                      </StyledTableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSaving}>
          Zrušiť
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? 'Ukladá sa...' : 'Uložiť'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

BulkAssignTeachers.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      assigned_teachers: PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            surname: PropTypes.string.isRequired
          })
        ])
      )
    })
  ).isRequired
};

export default BulkAssignTeachers;
