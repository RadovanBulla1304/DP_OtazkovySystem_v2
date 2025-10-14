import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import {
  useGetModulsBySubjectQuery,
  useGetUsersPointsSummaryMutation,
  useUpdatePointMutation
} from '@app/redux/api';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
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
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const UserPointsModal = ({ open, onClose, userIds }) => {
  const [getUsersPointsSummary, { data: pointsData, isLoading, error }] =
    useGetUsersPointsSummaryMutation();
  const [updatePoint] = useUpdatePointMutation();
  const [editingCell, setEditingCell] = useState(null); // { userId, category, moduleId }
  const [editValue, setEditValue] = useState('');

  // Get current subject ID and fetch modules
  const subjectId = useCurrentSubjectId();
  const { data: modules = [] } = useGetModulsBySubjectQuery(subjectId, {
    skip: !subjectId
  });

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (open && userIds.length > 0) {
      // Get real data
      getUsersPointsSummary(userIds);

      // Reset pagination when modal opens with new data
      setPage(0);
    }
  }, [open, userIds, getUsersPointsSummary]);

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
    // Check if there are any points for this category
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

    // Find the specific point record to update
    const userData = pointsData?.data?.find((u) => u.user._id === userId);
    if (!userData) {
      setEditingCell(null);
      return;
    }

    // Find matching point details for this category and module
    // First, try strict matching (module + category)
    let matchingPoints = userData.points.details.filter((detail) => {
      if (category === 'test_performance') return detail.category === 'test_performance';
      if (category === 'forum_participation') return detail.category === 'forum_participation';
      if (category === 'project_work') return detail.category === 'project_work';
      if (category === 'other') return detail.category === 'other';

      // For module-based categories
      if (!moduleId || moduleId.startsWith('empty-')) return false;

      // Check if this detail belongs to the module
      if (detail.question_id) {
        const module = modules.find((m) => m._id === moduleId);
        return module?.questions?.includes(detail.question_id) && detail.category === category;
      }

      return false;
    });

    // If no strict match found, try relaxed matching (just category for module-based)
    // This allows editing any point record of that category type
    if (
      matchingPoints.length === 0 &&
      !['test_performance', 'forum_participation', 'project_work', 'other'].includes(category)
    ) {
      matchingPoints = userData.points.details.filter((detail) => detail.category === category);
    }

    if (matchingPoints.length > 0) {
      // Calculate current sum of all matching points
      const currentSum = matchingPoints.reduce((sum, p) => sum + p.points, 0);

      // If the displayed value matches the sum, proceed
      if (currentSum === newValue) {
        setEditingCell(null);
        return;
      }

      // Calculate the difference to apply
      const difference = newValue - currentSum;

      // Update the first matching point by adding the difference
      const pointToUpdate = matchingPoints[0];
      const updatedPointValue = pointToUpdate.points + difference;

      // Don't allow negative points
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
        getUsersPointsSummary(userIds);
      } catch (error) {
        console.error('Error updating point:', error);
        toast.error('Chyba pri aktualizácii bodov');
      }
    } else {
      // No existing point records for this category at all
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

    // Check if cell has points and is editable
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '95vw',
          maxWidth: '95vw',
          maxHeight: '95vh',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          color: 'text.primary'
        }}
      >
        Body používateľov
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: '16px' }}>
        {isLoading && (
          <Box sx={{ textAlign: 'center', padding: '20px' }}>
            <Typography color="text.primary">Načítavanie bodov...</Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ textAlign: 'center', padding: '20px' }}>
            <Typography color="error" sx={{ fontWeight: 'bold' }}>
              Chyba pri načítavaní: {error.message}
            </Typography>
          </Box>
        )}

        {pointsData && (
          <>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Celkom používateľov: {pointsData ? pointsData.data.length : 0}
              </Typography>
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                overflowX: 'auto',
                '& .MuiTable-root': {
                  minWidth: '150%', // Makes the table wide enough to require scrolling
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
                  {/* Main header row with column groups */}
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        borderRight: '2px solid',
                        borderColor: 'divider',
                        fontWeight: 'bold',
                        color: 'text.primary'
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
                    {/* Dynamic module columns - show up to 12 columns */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const moduleIndex = i;
                      const module = modules[moduleIndex];
                      const moduleName = module ? module.title : `Modul ${i + 1}`;
                      const displayName = module ? moduleName : '-';

                      return (
                        <TableCell
                          key={`module-${i + 1}`}
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
                          {displayName}
                        </TableCell>
                      );
                    })}
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
                  {/* Activity type row */}
                  <TableRow>
                    {/* Dynamic module activity columns - 12 modules x 3 activities each */}
                    {Array.from({ length: 12 }, (_, i) => (
                      <React.Fragment key={`module-activities-${i + 1}`}>
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
                    {/* Extra columns */}
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
                  {/* Use real data if available, otherwise fallback to mock data, with pagination */}
                  {(pointsData ? pointsData.data : [])
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((userData) => {
                      // Group points by module and category
                      const pointsByModule = {};

                      // Initialize all modules (up to 12) with available modules, others as empty
                      for (let i = 0; i < 12; i++) {
                        const moduleId = modules[i]?._id || `empty-${i}`;
                        pointsByModule[moduleId] = {
                          question_creation: 0,
                          question_validation: 0,
                          question_reparation: 0,
                          moduleIndex: i, // Keep track of module position for display
                          moduleName: modules[i]?.title || null
                        };
                      }

                      // Additional categories
                      const extraPoints = {
                        test_performance: 0,
                        forum_participation: 0,
                        project_work: 0,
                        other: 0
                      };

                      // Process details to calculate points by module and extra categories
                      userData.points.details.forEach((detail) => {
                        // Special categories first
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

                        // First priority: try to find by question_id in modules
                        if (detail.question_id) {
                          const moduleWithQuestion = modules.find(
                            (module) =>
                              module.questions && module.questions.includes(detail.question_id)
                          );
                          if (moduleWithQuestion) {
                            targetModuleId = moduleWithQuestion._id;
                          }
                        }

                        // Second priority: try to extract week from reason and map intelligently
                        if (!targetModuleId) {
                          const weekMatch =
                            detail.reason?.match(/týždni (\d+)/i) ||
                            detail.reason?.match(/[Tt]ýždeň (\d+)/);

                          if (weekMatch && weekMatch[1]) {
                            const week = parseInt(weekMatch[1]);
                            // Intelligent mapping: distribute weeks across available modules
                            // If we have modules, distribute weeks among them cyclically
                            if (modules.length > 0) {
                              // Distribute weeks across available modules
                              // Week 1-3 -> Module 1, Week 4-6 -> Module 2, etc.
                              const moduleIndex = Math.floor((week - 1) / 3) % modules.length;
                              targetModuleId = modules[moduleIndex]._id;
                            } else {
                              // Fallback to empty slots if no modules available
                              const moduleIndex = Math.min(Math.floor((week - 1) / 3), 11);
                              targetModuleId = `empty-${moduleIndex}`;
                            }
                          }
                        }

                        // Fallback: put in first available module or first empty slot
                        if (!targetModuleId) {
                          targetModuleId = modules[0]?._id || 'empty-0';
                        }

                        // Add points to the target module
                        if (
                          pointsByModule[targetModuleId] &&
                          detail.category &&
                          pointsByModule[targetModuleId][detail.category] !== undefined
                        ) {
                          pointsByModule[targetModuleId][detail.category] += detail.points;
                        }
                      });

                      return (
                        <React.Fragment key={userData.user._id}>
                          <TableRow>
                            <TableCell sx={{ borderRight: '2px solid', borderColor: 'divider' }}>
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
                            {/* Modules 1-12 */}
                            {Array.from({ length: 12 }, (_, moduleIndex) => {
                              const moduleId = modules[moduleIndex]?._id || `empty-${moduleIndex}`;
                              const modulePoints = pointsByModule[moduleId] || {
                                question_creation: 0,
                                question_validation: 0,
                                question_reparation: 0
                              };

                              return (
                                <React.Fragment key={`module-${moduleIndex}`}>
                                  <EditableCell
                                    userId={userData.user._id}
                                    category="question_creation"
                                    moduleId={moduleId}
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
                                    moduleId={moduleId}
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
                                    moduleId={moduleId}
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
                        </React.Fragment>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          padding: '16px',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Pagination controls in the footer */}
        {pointsData && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pointsData.data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Riadkov na stránku:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} z ${count}`}
              sx={{
                border: 'none',
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontWeight: 'bold'
                }
              }}
            />
          </Box>
        )}

        <Button onClick={onClose} variant="outlined" color="error">
          Zrušiť
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UserPointsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userIds: PropTypes.array.isRequired
};

export default UserPointsModal;
