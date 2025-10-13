import { useGetAllProjectRatingsQuery, useSaveProjectRatingMutation } from '@app/redux/api';
import {
  Box,
  Button,
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
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as authService from '@app/pages/auth/authService';

const PeerEvaluationModal = ({ open, onClose, subjectId }) => {
  const [ratings, setRatings] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  
  const currentUser = authService.getUserFromStorage();

  const {
    data: ratingsData,
    isLoading,
    refetch
  } = useGetAllProjectRatingsQuery(subjectId ? { subjectId } : {}, { skip: !open });

  const [saveRating, { isLoading: isSaving }] = useSaveProjectRatingMutation();

  const projects = ratingsData?.data?.projects || [];
  const students = ratingsData?.data?.students || [];

  useEffect(() => {
    const existingRatings = ratingsData?.data?.ratings || [];
    if (existingRatings.length > 0) {
      const ratingsMap = {};
      existingRatings.forEach((rating) => {
        // Check if rating.user and rating.ratedProject exist before accessing _id
        if (rating.user && rating.ratedProject) {
          const key = `${rating.user._id}-${rating.ratedProject._id}`;
          ratingsMap[key] = rating.rating;
        }
      });
      setRatings(ratingsMap);
    }
  }, [ratingsData]);

  const handleCellClick = (studentId, projectId, studentProjectId) => {
    // Prevent editing if not the current user's row
    if (currentUser?._id !== studentId) {
      return;
    }
    
    // Prevent editing own project
    if (studentProjectId === projectId) {
      return;
    }
    setEditingCell(`${studentId}-${projectId}`);
  };

  const handleCellChange = (studentId, projectId, value) => {
    const numValue = value === '' ? '' : Number(value);

    // Only allow positive numbers
    if (numValue !== '' && (isNaN(numValue) || numValue < 0)) {
      return;
    }

    const key = `${studentId}-${projectId}`;
    setRatings((prev) => ({
      ...prev,
      [key]: numValue
    }));
  };

  const handleCellBlur = async (studentId, projectId, studentProjectId) => {
    setEditingCell(null);

    // Don't save if it's the user's own project
    if (studentProjectId === projectId) {
      return;
    }

    const key = `${studentId}-${projectId}`;
    const rating = ratings[key];

    // Don't save empty ratings
    if (rating === '' || rating === undefined) {
      return;
    }

    try {
      await saveRating({
        ratedProjectId: projectId,
        rating: Number(rating)
      }).unwrap();

      toast.success('Hodnotenie bolo uložené');
      refetch();
    } catch (error) {
      console.error('Error saving rating:', error);
      toast.error('Chyba pri ukladaní hodnotenia');
    }
  };

  const handleKeyDown = (e, studentId, projectId, studentProjectId) => {
    if (e.key === 'Enter') {
      handleCellBlur(studentId, projectId, studentProjectId);
    }
  };

  const getCellValue = (studentId, projectId) => {
    const key = `${studentId}-${projectId}`;
    return ratings[key] !== undefined ? ratings[key] : '';
  };

  const getColumnAverage = (projectId) => {
    let sum = 0;
    let count = 0;
    students.forEach((student) => {
      const key = `${student._id}-${projectId}`;
      const value = ratings[key];
      if (value !== undefined && value !== '') {
        sum += Number(value);
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : '0.0';
  };

  const isOwnProject = (studentProjectId, projectId) => {
    return studentProjectId === projectId;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Vzájomné hodnotenie projektov</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    minWidth: 200,
                    position: 'sticky',
                    left: 0,
                    zIndex: 3
                  }}
                >
                  Študent
                </TableCell>
                {projects.map((project) => (
                  <TableCell
                    key={project._id}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: 'primary.main',
                      color: 'white',
                      minWidth: 120
                    }}
                  >
                    {project.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id} hover>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: 'background.paper',
                      zIndex: 2
                    }}
                  >
                    <Box>
                      <Typography variant="body2">{student.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {student.studentNumber}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        ({student.projectName})
                      </Typography>
                    </Box>
                  </TableCell>
                  {projects.map((project) => {
                    const isOwn = isOwnProject(student.projectId, project._id);
                    const isCurrentUserRow = currentUser?._id === student._id;
                    const cellKey = `${student._id}-${project._id}`;
                    const isEditing = editingCell === cellKey;
                    const value = getCellValue(student._id, project._id);
                    
                    // Determine cursor: not-allowed for own project, default for other rows, pointer for current user's row
                    const cursorStyle = isOwn ? 'not-allowed' : (isCurrentUserRow ? 'pointer' : 'default');

                    return (
                      <TableCell
                        key={project._id}
                        align="center"
                        sx={{
                          cursor: cursorStyle,
                          backgroundColor: isOwn ? '#bebebe' : 'transparent',
                          '&:hover': {
                            backgroundColor: isOwn ? '#bebebe' : (isCurrentUserRow ? '#e3f2fd' : 'transparent')
                          },
                          padding: '4px'
                        }}
                        onClick={() =>
                          !isOwn && handleCellClick(student._id, project._id, student.projectId)
                        }
                      >
                        {isOwn ? (
                          <Typography variant="body2" color="textSecondary">
                            -
                          </Typography>
                        ) : isEditing ? (
                          <TextField
                            autoFocus
                            type="number"
                            value={value}
                            onChange={(e) =>
                              handleCellChange(student._id, project._id, e.target.value)
                            }
                            onBlur={() =>
                              handleCellBlur(student._id, project._id, student.projectId)
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, student._id, project._id, student.projectId)
                            }
                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                            size="small"
                            sx={{ width: '100%' }}
                          />
                        ) : (
                          <Typography variant="body2">{value || '-'}</Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {/* Average row */}
              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#f0f0f0',
                    zIndex: 2
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    Priemer
                  </Typography>
                </TableCell>
                {projects.map((project) => (
                  <TableCell key={project._id} align="center">
                    <Typography variant="body2" fontWeight="bold">
                      {getColumnAverage(project._id)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {students.length === 0 && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="textSecondary">
              Žiadni študenti nie sú priradení k projektom.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving} variant="outlined" color="error">
          Zrušiť
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PeerEvaluationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subjectId: PropTypes.string
};

export default PeerEvaluationModal;
