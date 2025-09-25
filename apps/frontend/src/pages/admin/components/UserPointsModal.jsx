import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import { useGetModulsBySubjectQuery, useGetUsersPointsSummaryMutation } from '@app/redux/api';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const UserPointsModal = ({ open, onClose, userIds }) => {
  const [getUsersPointsSummary, { data: pointsData, isLoading, error }] =
    useGetUsersPointsSummaryMutation();
  const [expandedUser, setExpandedUser] = useState(null);

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

  // Capitalize first letter of category
  const formatCategory = (category) => {
    if (!category) return '';
    return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Format date to readable form
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm');
  };

  const handleToggleDetails = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    // Close any expanded rows when changing page
    setExpandedUser(null);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    // Close any expanded rows when changing rows per page
    setExpandedUser(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#f8f8f8',
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 'bold',
          fontSize: '1.2rem'
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
      <DialogContent sx={{ padding: '16px', backgroundColor: '#fafafa' }}>
        {isLoading && (
          <Box sx={{ textAlign: 'center', padding: '20px' }}>
            <Typography>Načítavanie bodov...</Typography>
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
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
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
                    backgroundColor: '#f5f5f5',
                    borderBottom: '2px solid rgba(224, 224, 224, 1)'
                  },
                  '& .MuiTableRow-root': {
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'rgba(0, 0, 0, 0.01)'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  },
                  '& .MuiTableCell-head': {
                    backgroundColor: '#f5f5f5',
                    color: '#333333'
                  }
                }}
              >
                <TableHead sx={{ borderBottom: '3px solid rgba(224, 224, 224, 1)' }}>
                  {/* Main header row with column groups */}
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        fontWeight: 'bold'
                      }}
                    >
                      Používateľ
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        fontWeight: 'bold'
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
                            borderRight: '2px solid rgba(224, 224, 224, 1)',
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                            fontWeight: 'bold'
                          }}
                        >
                          {displayName}
                        </TableCell>
                      );
                    })}
                    <TableCell
                      align="center"
                      sx={{
                        borderRight: '1px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                        fontWeight: 'bold'
                      }}
                    >
                      Test
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderRight: '1px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                        fontWeight: 'bold'
                      }}
                    >
                      Projekt
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                        fontWeight: 'bold'
                      }}
                    >
                      Bonus
                    </TableCell>
                    <TableCell rowSpan={2} sx={{ fontWeight: 'bold' }}>
                      Akcie
                    </TableCell>
                  </TableRow>
                  {/* Activity type row */}
                  <TableRow>
                    {/* Dynamic module activity columns - 12 modules x 3 activities each */}
                    {Array.from({ length: 12 }, (_, i) => (
                      <React.Fragment key={`module-activities-${i + 1}`}>
                        <TableCell
                          align="center"
                          sx={{ borderRight: '1px solid rgba(224, 224, 224, 0.5)' }}
                        >
                          Pridať
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ borderRight: '1px solid rgba(224, 224, 224, 0.5)' }}
                        >
                          Validovať
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)' }}
                        >
                          Potvrdenie
                        </TableCell>
                      </React.Fragment>
                    ))}
                    {/* Extra columns */}
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}></TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}></TableCell>
                    <TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)' }}></TableCell>
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
                        test: 0,
                        project: 0,
                        bonus: 0
                      };

                      // Process details to calculate points by module and extra categories
                      userData.points.details.forEach((detail) => {
                        // Special categories first
                        if (detail.category === 'test') {
                          extraPoints.test += detail.points;
                          return;
                        } else if (detail.category === 'project') {
                          extraPoints.project += detail.points;
                          return;
                        } else if (detail.category === 'bonus') {
                          extraPoints.bonus += detail.points;
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
                            <TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)' }}>
                              <Typography variant="subtitle2">
                                {userData.user.name} {userData.user.surname}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {userData.user.studentNumber || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                borderRight: '2px solid rgba(224, 224, 224, 1)',
                                fontWeight: 'bold'
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
                                  <TableCell
                                    align="center"
                                    sx={{
                                      borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                                      bgcolor:
                                        moduleIndex % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                                    }}
                                  >
                                    {modulePoints.question_creation || '-'}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      borderRight: '1px solid rgba(224, 224, 0.5)',
                                      bgcolor:
                                        moduleIndex % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                                    }}
                                  >
                                    {modulePoints.question_validation || '-'}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      borderRight: '2px solid rgba(224, 224, 224, 1)',
                                      bgcolor:
                                        moduleIndex % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                                    }}
                                  >
                                    {modulePoints.question_reparation || '-'}
                                  </TableCell>
                                </React.Fragment>
                              );
                            })}

                            {/* Extra categories */}
                            <TableCell
                              align="center"
                              sx={{
                                borderRight: '1px solid rgba(224, 224, 224, 1)',
                                bgcolor: 'rgba(0, 0, 0, 0.03)',
                                fontWeight: 'bold'
                              }}
                            >
                              {extraPoints.test || 0}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                borderRight: '1px solid rgba(224, 224, 224, 1)',
                                bgcolor: 'rgba(0, 0, 0, 0.03)',
                                fontWeight: 'bold'
                              }}
                            >
                              {extraPoints.project || 0}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{
                                borderRight: '2px solid rgba(224, 224, 224, 1)',
                                bgcolor: 'rgba(0, 0, 0, 0.03)',
                                fontWeight: 'bold'
                              }}
                            >
                              {extraPoints.bonus || 0}
                            </TableCell>

                            <TableCell align="center">
                              <Button
                                size="small"
                                variant={
                                  expandedUser === userData.user._id ? 'contained' : 'outlined'
                                }
                                color={expandedUser === userData.user._id ? 'secondary' : 'primary'}
                                onClick={() => handleToggleDetails(userData.user._id)}
                                sx={{
                                  minWidth: '120px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                {expandedUser === userData.user._id
                                  ? 'Skryť detail'
                                  : 'Zobraziť detail'}
                              </Button>
                            </TableCell>
                          </TableRow>
                          {/* Expanded details view */}
                          {expandedUser === userData.user._id && (
                            <TableRow>
                              <TableCell colSpan={42} sx={{ py: 0 }}>
                                <Box sx={{ p: 2 }}>
                                  <Typography variant="h6" gutterBottom>
                                    Detail bodov používateľa {userData.user.name}{' '}
                                    {userData.user.surname}
                                  </Typography>
                                  <Divider sx={{ my: 1 }} />

                                  {/* Group points by module for better organization */}
                                  {Array.from({ length: 12 }, (_, moduleIndex) => {
                                    const module = modules[moduleIndex];

                                    // Filter points for this module
                                    const modulePoints = userData.points.details.filter(
                                      (detail) => {
                                        // Special categories don't belong to modules
                                        if (
                                          ['test', 'project', 'bonus'].includes(detail.category)
                                        ) {
                                          return false;
                                        }

                                        // First priority: try question-based matching
                                        if (detail.question_id && module?.questions) {
                                          return module.questions.includes(detail.question_id);
                                        }

                                        // Second priority: try week-based matching with intelligent distribution
                                        const weekMatch =
                                          detail.reason?.match(/týždni (\d+)/i) ||
                                          detail.reason?.match(/[Tt]ýždeň (\d+)/);

                                        if (weekMatch && weekMatch[1]) {
                                          const week = parseInt(weekMatch[1]);
                                          if (modules.length > 0) {
                                            // Distribute weeks across available modules (Week 1-3 -> Module 1, Week 4-6 -> Module 2, etc.)
                                            const targetModuleIndex =
                                              Math.floor((week - 1) / 3) % modules.length;
                                            return targetModuleIndex === moduleIndex;
                                          } else {
                                            // Fallback for empty modules
                                            const targetModuleIndex = Math.min(
                                              Math.floor((week - 1) / 3),
                                              11
                                            );
                                            return targetModuleIndex === moduleIndex;
                                          }
                                        }

                                        return false;
                                      }
                                    );

                                    // Show all modules, even empty ones to maintain structure
                                    const hasPoints = modulePoints.length > 0;
                                    const moduleName = module?.title || `-`;

                                    return (
                                      <Box key={`module-details-${moduleIndex}`} sx={{ mb: 2 }}>
                                        <Typography
                                          variant="subtitle1"
                                          sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}
                                        >
                                          Modul {moduleIndex + 1}: {moduleName}
                                        </Typography>
                                        {hasPoints ? (
                                          <Table size="small">
                                            <TableHead>
                                              <TableRow>
                                                <TableCell>Dátum</TableCell>
                                                <TableCell>Kategória</TableCell>
                                                <TableCell>Body</TableCell>
                                                <TableCell>Dôvod</TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {modulePoints.map((detail) => (
                                                <TableRow key={detail._id}>
                                                  <TableCell>
                                                    {formatDate(detail.createdAt)}
                                                  </TableCell>
                                                  <TableCell>
                                                    {formatCategory(detail.category)}
                                                  </TableCell>
                                                  <TableCell>{detail.points}</TableCell>
                                                  <TableCell>{detail.reason}</TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        ) : (
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ ml: 2 }}
                                          >
                                            Žiadne body v tomto týždni.
                                          </Typography>
                                        )}
                                      </Box>
                                    );
                                  })}

                                  {/* Special categories section */}
                                  {['test', 'project', 'bonus'].map((category) => {
                                    const categoryPoints = userData.points.details.filter(
                                      (detail) => detail.category === category
                                    );

                                    if (categoryPoints.length === 0) return null;

                                    return (
                                      <Box key={`category-${category}`} sx={{ mb: 2 }}>
                                        <Typography
                                          variant="subtitle1"
                                          sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}
                                        >
                                          {formatCategory(category)}
                                        </Typography>
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Dátum</TableCell>
                                              <TableCell>Body</TableCell>
                                              <TableCell>Dôvod</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {categoryPoints.map((detail) => (
                                              <TableRow key={detail._id}>
                                                <TableCell>
                                                  {formatDate(detail.createdAt)}
                                                </TableCell>
                                                <TableCell>{detail.points}</TableCell>
                                                <TableCell>{detail.reason}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </Box>
                                    );
                                  })}

                                  {/* Show message if no detailed points data */}
                                  {userData.points.details.length === 0 && (
                                    <Typography variant="body2" color="text.secondary">
                                      Používateľ nemá žiadne body.
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
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
          backgroundColor: '#f8f8f8',
          borderTop: '1px solid #e0e0e0',
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

        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            fontWeight: 'bold',
            minWidth: '120px'
          }}
        >
          Zavrieť
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
