import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import {
  useGetModulsBySubjectQuery,
  useGetUsersAssignedToSubjectQuery,
  useGetUsersPointsSummaryMutation,
  useUpdatePointMutation
} from '@app/redux/api';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const TeacherDashboard = () => {
  const subjectId = useCurrentSubjectId();

  // Fetch modules for current subject
  const { data: modules = [], isFetching: isModulesFetching } = useGetModulsBySubjectQuery(
    subjectId,
    { skip: !subjectId }
  );

  // Selected module
  const [selectedModulId, setSelectedModulId] = useState('');

  // Fetch users assigned to this subject
  const { data: usersData = [], isLoading: isUsersLoading } = useGetUsersAssignedToSubjectQuery(
    { subjectId },
    { skip: !subjectId }
  );

  // Points
  const [
    getUsersPointsSummary,
    { data: pointsData, isLoading: isPointsLoading, reset: resetPointsData }
  ] = useGetUsersPointsSummaryMutation();
  const [updatePoint] = useUpdatePointMutation();

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Editing state
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Auto-select first module
  useEffect(() => {
    if (!isModulesFetching && modules.length > 0 && !selectedModulId) {
      setSelectedModulId(modules[0]._id);
    }
  }, [modules, isModulesFetching, selectedModulId]);

  // Reset module selection and clear stale points data when subject changes
  useEffect(() => {
    setSelectedModulId('');
    setPage(0);
    resetPointsData();
  }, [subjectId, resetPointsData]);

  // Fetch points for all users in this subject
  useEffect(() => {
    if (usersData && usersData.length > 0 && subjectId) {
      const userIds = usersData.map((u) => u._id);
      getUsersPointsSummary({ userIds, subjectId });
    }
  }, [usersData, subjectId, getUsersPointsSummary]);

  const handleModulChange = (event) => {
    setSelectedModulId(event.target.value);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Edit cell handlers
  const handleCellClick = (userId, category, moduleId, currentValue, pointDetails) => {
    if (!pointDetails || pointDetails.length === 0) {
      toast.info('Používateľ nemá žiadne body v tejto kategórii na úpravu');
      return;
    }
    setEditingCell({ userId, category, moduleId, pointDetails });
    setEditValue(currentValue || '0');
  };

  const handleCellBlur = async () => {
    if (!editingCell) return;

    const newValue = parseInt(editValue) || 0;
    const { userId, category, moduleId } = editingCell;

    const userData = pointsData?.data?.find((u) => u.user._id === userId);
    if (!userData) {
      setEditingCell(null);
      return;
    }

    let matchingPoints = userData.points.details.filter((detail) => {
      if (category === 'test_performance') return detail.category === 'test_performance';
      if (category === 'forum_participation') return detail.category === 'forum_participation';
      if (category === 'project_work') return detail.category === 'project_work';
      if (category === 'other') return detail.category === 'other';

      if (!moduleId || moduleId.startsWith('empty-')) return false;

      if (detail.question_id) {
        const module = modules.find((m) => m._id === moduleId);
        return module?.questions?.includes(detail.question_id) && detail.category === category;
      }

      return false;
    });

    if (
      matchingPoints.length === 0 &&
      !['test_performance', 'forum_participation', 'project_work', 'other'].includes(category)
    ) {
      matchingPoints = userData.points.details.filter((detail) => detail.category === category);
    }

    if (matchingPoints.length > 0) {
      const currentSum = matchingPoints.reduce((sum, p) => sum + p.points, 0);

      if (currentSum === newValue) {
        setEditingCell(null);
        return;
      }

      const difference = newValue - currentSum;
      const pointToUpdate = matchingPoints[0];
      const updatedPointValue = pointToUpdate.points + difference;

      if (updatedPointValue < 0) {
        toast.error('Body nemôžu byť záporné');
        setEditingCell(null);
        return;
      }

      try {
        await updatePoint({
          pointId: pointToUpdate._id,
          points: updatedPointValue,
          reason: pointToUpdate.reason
        }).unwrap();

        toast.success(
          `Body aktualizované: ${currentSum} → ${newValue} (${difference > 0 ? '+' : ''}${difference})`
        );
        // Refresh data
        if (usersData && usersData.length > 0 && subjectId) {
          const userIds = usersData.map((u) => u._id);
          getUsersPointsSummary({ userIds, subjectId });
        }
      } catch (error) {
        console.error('Error updating point:', error);
        toast.error('Chyba pri aktualizácii bodov');
      }
    } else {
      toast.info('Používateľ nemá žiadne body v tejto kategórii na úpravu');
    }

    setEditingCell(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Editable Cell Component
  const EditableCell = ({ userId, category, moduleId, value, pointDetails, sx }) => {
    const isEditing =
      editingCell?.userId === userId &&
      editingCell?.category === category &&
      editingCell?.moduleId === moduleId;

    const hasPoints = pointDetails && pointDetails.length > 0;
    const cursorStyle = hasPoints ? 'pointer' : 'default';

    return (
      <TableCell align="center" sx={{ ...sx, cursor: cursorStyle, position: 'relative' }}>
        {isEditing ? (
          <TextField
            autoFocus
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={handleKeyDown}
            inputProps={{ min: 0, style: { textAlign: 'center' } }}
            size="small"
            sx={{ width: '60px' }}
          />
        ) : (
          <Box
            onClick={() => handleCellClick(userId, category, moduleId, value, pointDetails)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              '&:hover .edit-icon': {
                opacity: hasPoints ? 1 : 0
              }
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: hasPoints ? 'text.primary' : 'text.disabled'
              }}
            >
              {value || '-'}
            </Typography>
            {hasPoints && (
              <Tooltip title="Kliknite pre úpravu">
                <EditIcon
                  className="edit-icon"
                  sx={{
                    fontSize: 14,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    color: 'text.secondary'
                  }}
                />
              </Tooltip>
            )}
          </Box>
        )}
      </TableCell>
    );
  };

  EditableCell.propTypes = {
    userId: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    moduleId: PropTypes.string,
    value: PropTypes.number,
    pointDetails: PropTypes.array,
    sx: PropTypes.object
  };

  // Memoized data rows
  const dataRows = useMemo(() => {
    return pointsData?.data || [];
  }, [pointsData]);

  if (!subjectId) {
    return (
      <Box sx={{ pt: 2, px: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Dashboard učiteľa
        </Typography>
        <Typography color="text.secondary">Vyberte predmet v prepínači predmetov.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 2, px: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dashboard učiteľa
      </Typography>

      {/* Module selector */}
      {isModulesFetching ? (
        <CircularProgress />
      ) : modules.length > 0 ? (
        <FormControl fullWidth sx={{ maxWidth: 400, mb: 3 }}>
          <InputLabel id="teacher-modul-select-label">Modul</InputLabel>
          <Select
            labelId="teacher-modul-select-label"
            value={selectedModulId}
            label="Modul"
            onChange={handleModulChange}
          >
            {modules.map((modul) => (
              <MenuItem key={modul._id} value={modul._id}>
                {modul.name || modul.title || modul._id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Pre tento predmet nie sú žiadne moduly.
        </Typography>
      )}

      {/* Points table */}
      {(isUsersLoading || isPointsLoading) && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 1 }} color="text.secondary">
            Načítavanie bodov...
          </Typography>
        </Box>
      )}

      {!isUsersLoading && !isPointsLoading && pointsData && usersData.length > 0 && (
        <>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Celkom používateľov: {dataRows.length}
            </Typography>
          </Box>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer
              sx={{
                overflowX: 'auto',
                maxHeight: 'calc(100vh - 320px)',
                '& .MuiTable-root': {
                  minWidth: modules.length > 4 ? '150%' : '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0
                }
              }}
            >
              <Table
                size="small"
                stickyHeader
                sx={{
                  '& .MuiTableHead-root': {
                    borderBottom: '2px solid',
                    borderColor: 'divider'
                  },
                  '& .MuiTableRow-root': {
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'action.hover'
                    },
                    '&:hover': {
                      backgroundColor: 'action.selected'
                    }
                  },
                  '& .MuiTableCell-head': {
                    color: 'text.primary'
                  },
                  '& .MuiTableCell-body': {
                    color: 'text.primary'
                  }
                }}
              >
                <TableHead sx={{ borderBottom: '3px solid', borderColor: 'divider' }}>
                  {/* Main header row */}
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        fontWeight: 'bold',
                        color: 'text.primary',
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        backgroundColor: 'background.paper'
                      }}
                    >
                      Používateľ
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        fontWeight: 'bold',
                        color: 'text.primary'
                      }}
                    >
                      Celkové body
                    </TableCell>
                    {/* Dynamic module columns */}
                    {modules.map((module, i) => (
                      <TableCell
                        key={`module-${module._id}`}
                        colSpan={3}
                        align="center"
                        sx={{
                          borderRight: '2px solid',
                          borderColor: 'divider',
                          bgcolor: 'action.hover',
                          fontWeight: 'bold',
                          color: 'text.primary'
                        }}
                      >
                        {module.title || module.name || `Modul ${i + 1}`}
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      sx={{
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'action.selected',
                        fontWeight: 'bold',
                        color: 'text.primary'
                      }}
                    >
                      Test
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'action.selected',
                        fontWeight: 'bold',
                        color: 'text.primary'
                      }}
                    >
                      Fórum
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'action.selected',
                        fontWeight: 'bold',
                        color: 'text.primary'
                      }}
                    >
                      Projekt
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        bgcolor: 'action.selected',
                        fontWeight: 'bold',
                        color: 'text.primary'
                      }}
                    >
                      Iné
                    </TableCell>
                  </TableRow>
                  {/* Activity type sub-header row */}
                  <TableRow>
                    {modules.map((module) => (
                      <React.Fragment key={`module-activities-${module._id}`}>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            color: 'text.primary'
                          }}
                        >
                          Pridať
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            color: 'text.primary'
                          }}
                        >
                          Validovať
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: '2px solid',
                            borderColor: 'divider',
                            color: 'text.primary'
                          }}
                        >
                          Potvrdenie
                        </TableCell>
                      </React.Fragment>
                    ))}
                    {/* Extra columns sub-headers */}
                    <TableCell
                      sx={{ borderRight: '1px solid', borderColor: 'divider' }}
                    ></TableCell>
                    <TableCell
                      sx={{ borderRight: '1px solid', borderColor: 'divider' }}
                    ></TableCell>
                    <TableCell
                      sx={{ borderRight: '1px solid', borderColor: 'divider' }}
                    ></TableCell>
                    <TableCell
                      sx={{ borderRight: '2px solid', borderColor: 'divider' }}
                    ></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((userData) => {
                      // Group points by module and category
                      const pointsByModule = {};

                      modules.forEach((mod) => {
                        pointsByModule[mod._id] = {
                          question_creation: 0,
                          question_validation: 0,
                          question_reparation: 0
                        };
                      });

                      const extraPoints = {
                        test_performance: 0,
                        forum_participation: 0,
                        project_work: 0,
                        other: 0
                      };

                      userData.points.details.forEach((detail) => {
                        if (detail.category === 'test_performance') {
                          extraPoints.test_performance += detail.points;
                          return;
                        } else if (detail.category === 'forum_participation') {
                          extraPoints.forum_participation += detail.points;
                          return;
                        } else if (detail.category === 'project_work') {
                          extraPoints.project_work += detail.points;
                          return;
                        } else if (detail.category === 'other') {
                          extraPoints.other += detail.points;
                          return;
                        }

                        let targetModuleId;

                        if (detail.question_id) {
                          const moduleWithQuestion = modules.find(
                            (module) =>
                              module.questions && module.questions.includes(detail.question_id)
                          );
                          if (moduleWithQuestion) {
                            targetModuleId = moduleWithQuestion._id;
                          }
                        }

                        if (!targetModuleId) {
                          const weekMatch =
                            detail.reason?.match(/týždni (\d+)/i) ||
                            detail.reason?.match(/[Tt]ýždeň (\d+)/);

                          if (weekMatch && weekMatch[1]) {
                            const week = parseInt(weekMatch[1]);
                            if (modules.length > 0) {
                              const moduleIndex = Math.floor((week - 1) / 3) % modules.length;
                              targetModuleId = modules[moduleIndex]._id;
                            }
                          }
                        }

                        if (!targetModuleId) {
                          targetModuleId = modules[0]?._id;
                        }

                        if (
                          targetModuleId &&
                          pointsByModule[targetModuleId] &&
                          detail.category &&
                          pointsByModule[targetModuleId][detail.category] !== undefined
                        ) {
                          pointsByModule[targetModuleId][detail.category] += detail.points;
                        }
                      });

                      return (
                        <TableRow key={userData.user._id}>
                          <TableCell
                            sx={{
                              borderRight: '2px solid',
                              borderColor: 'divider',
                              position: 'sticky',
                              left: 0,
                              zIndex: 1,
                              backgroundColor: 'background.paper'
                            }}
                          >
                            <Typography variant="subtitle2" color="text.primary">
                              {userData.user.name} {userData.user.surname}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {userData.user.studentNumber || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              borderRight: '2px solid',
                              borderColor: 'divider',
                              fontWeight: 'bold',
                              color: 'text.primary'
                            }}
                          >
                            {userData.points.totalPoints || 0}
                          </TableCell>
                          {/* Module columns */}
                          {modules.map((mod, moduleIndex) => {
                            const modulePoints = pointsByModule[mod._id] || {
                              question_creation: 0,
                              question_validation: 0,
                              question_reparation: 0
                            };

                            return (
                              <React.Fragment key={`module-${mod._id}`}>
                                <EditableCell
                                  userId={userData.user._id}
                                  category="question_creation"
                                  moduleId={mod._id}
                                  value={modulePoints.question_creation}
                                  pointDetails={userData.points.details}
                                  sx={{
                                    borderRight: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: moduleIndex % 2 === 0 ? 'action.hover' : 'inherit'
                                  }}
                                />
                                <EditableCell
                                  userId={userData.user._id}
                                  category="question_validation"
                                  moduleId={mod._id}
                                  value={modulePoints.question_validation}
                                  pointDetails={userData.points.details}
                                  sx={{
                                    borderRight: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: moduleIndex % 2 === 0 ? 'action.hover' : 'inherit'
                                  }}
                                />
                                <EditableCell
                                  userId={userData.user._id}
                                  category="question_reparation"
                                  moduleId={mod._id}
                                  value={modulePoints.question_reparation}
                                  pointDetails={userData.points.details}
                                  sx={{
                                    borderRight: '2px solid',
                                    borderColor: 'divider',
                                    bgcolor: moduleIndex % 2 === 0 ? 'action.hover' : 'inherit'
                                  }}
                                />
                              </React.Fragment>
                            );
                          })}

                          {/* Extra categories */}
                          <EditableCell
                            userId={userData.user._id}
                            category="test_performance"
                            moduleId={null}
                            value={extraPoints.test_performance}
                            pointDetails={userData.points.details}
                            sx={{
                              borderRight: '1px solid',
                              borderColor: 'divider',
                              bgcolor: 'action.selected',
                              fontWeight: 'bold'
                            }}
                          />
                          <EditableCell
                            userId={userData.user._id}
                            category="forum_participation"
                            moduleId={null}
                            value={extraPoints.forum_participation}
                            pointDetails={userData.points.details}
                            sx={{
                              borderRight: '1px solid',
                              borderColor: 'divider',
                              bgcolor: 'action.selected',
                              fontWeight: 'bold'
                            }}
                          />
                          <EditableCell
                            userId={userData.user._id}
                            category="project_work"
                            moduleId={null}
                            value={extraPoints.project_work}
                            pointDetails={userData.points.details}
                            sx={{
                              borderRight: '1px solid',
                              borderColor: 'divider',
                              bgcolor: 'action.selected',
                              fontWeight: 'bold'
                            }}
                          />
                          <EditableCell
                            userId={userData.user._id}
                            category="other"
                            moduleId={null}
                            value={extraPoints.other}
                            pointDetails={userData.points.details}
                            sx={{
                              borderRight: '2px solid',
                              borderColor: 'divider',
                              bgcolor: 'action.selected',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={dataRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Riadkov na stránku:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} z ${count}`}
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontWeight: 'bold'
                }
              }}
            />
          </Paper>
        </>
      )}

      {!isUsersLoading && !isPointsLoading && usersData.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Pre tento predmet nie sú priradení žiadni používatelia.
        </Typography>
      )}
    </Box>
  );
};

export default TeacherDashboard;
