import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useAssignTeacherToSubjectMutation,
  useGetAllTeachersQuery,
  useUnassignTeacherFromSubjectMutation
} from '../../../../redux/api';

const AssignTeachersToSubject = ({ open, onClose, subject }) => {
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [optimisticRemovedTeachers, setOptimisticRemovedTeachers] = useState([]);

  const { data: teachers = [], isLoading: loadingTeachers } = useGetAllTeachersQuery();
  const [assignTeacher, { isLoading: isAssigning }] = useAssignTeacherToSubjectMutation();
  const [unassignTeacher, { isLoading: isUnassigning }] = useUnassignTeacherFromSubjectMutation();

  // Get currently assigned teacher IDs (filter out optimistically removed ones)
  const assignedTeacherIds =
    subject?.assigned_teachers
      ?.map((t) => (typeof t === 'string' ? t : t._id))
      .filter((id) => !optimisticRemovedTeachers.includes(id)) || [];

  // Filter out already assigned teachers
  const availableTeachers = teachers.filter((teacher) => !assignedTeacherIds.includes(teacher._id));

  const handleAssign = async () => {
    if (selectedTeachers.length === 0) {
      toast.warning('Vyberte aspoň jedného učiteľa');
      return;
    }

    try {
      await assignTeacher({
        subjectId: subject._id,
        teacherId: selectedTeachers
      }).unwrap();

      toast.success('Učitelia boli úspešne priradení k predmetu');
      setSelectedTeachers([]);
      // Clear optimistic removals when successfully assigning
      setOptimisticRemovedTeachers([]);
      onClose();
    } catch (error) {
      console.error('Error assigning teachers:', error);
      toast.error('Chyba pri priraďovaní učiteľov');
    }
  };

  const handleUnassign = async (teacherId) => {
    // Optimistically remove the teacher from UI immediately
    setOptimisticRemovedTeachers((prev) => [...prev, teacherId]);

    try {
      await unassignTeacher({
        subjectId: subject._id,
        teacherId
      }).unwrap();

      toast.success('Učiteľ bol úspešne odobraný z predmetu');
    } catch (error) {
      console.error('Error unassigning teacher:', error);
      toast.error('Chyba pri odoberaní učiteľa');
      // Rollback optimistic update on error
      setOptimisticRemovedTeachers((prev) => prev.filter((id) => id !== teacherId));
    }
  };

  const handleChange = (event) => {
    setSelectedTeachers(event.target.value);
  };

  const handleClose = () => {
    setSelectedTeachers([]);
    setOptimisticRemovedTeachers([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Priradenie učiteľov k predmetu</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Predmet: {subject?.name}
          </Typography>
        </Box>

        {/* Currently Assigned Teachers */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Priradení učitelia
          </Typography>
          {subject?.assigned_teachers && subject.assigned_teachers.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {subject.assigned_teachers
                .filter((teacher) => {
                  const teacherId = typeof teacher === 'string' ? teacher : teacher._id;
                  return !optimisticRemovedTeachers.includes(teacherId);
                })
                .map((teacher) => {
                  const teacherData =
                    typeof teacher === 'string' ? teachers.find((t) => t._id === teacher) : teacher;

                  if (!teacherData) return null;

                  return (
                    <Chip
                      key={teacherData._id}
                      label={`${teacherData.name} ${teacherData.surname}`}
                      onDelete={() => handleUnassign(teacherData._id)}
                      color="primary"
                      disabled={isUnassigning}
                    />
                  );
                })}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Žiadni učitelia nie sú priradení
            </Typography>
          )}
        </Box>

        {/* Assign New Teachers */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Priradiť nových učiteľov
          </Typography>
          {loadingTeachers ? (
            <CircularProgress size={24} />
          ) : (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Vyberte učiteľov</InputLabel>
              <Select
                multiple
                value={selectedTeachers}
                onChange={handleChange}
                input={<OutlinedInput label="Vyberte učiteľov" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const teacher = availableTeachers.find((t) => t._id === value);
                      return (
                        <Chip
                          key={value}
                          label={teacher ? `${teacher.name} ${teacher.surname}` : value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {availableTeachers.length === 0 ? (
                  <MenuItem disabled>
                    <em>Žiadni dostupní učitelia</em>
                  </MenuItem>
                ) : (
                  availableTeachers.map((teacher) => (
                    <MenuItem key={teacher._id} value={teacher._id}>
                      {teacher.name} {teacher.surname} ({teacher.email})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isAssigning || isUnassigning}>
          Zrušiť
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={selectedTeachers.length === 0 || isAssigning || isUnassigning}
        >
          {isAssigning ? 'Priraďovanie...' : 'Priradiť'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AssignTeachersToSubject.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subject: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    assigned_teachers: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          surname: PropTypes.string.isRequired,
          email: PropTypes.string
        })
      ])
    )
  }).isRequired
};

export default AssignTeachersToSubject;
