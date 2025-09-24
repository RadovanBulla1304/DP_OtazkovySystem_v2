import { useGetUsersPointsSummaryMutation } from '@app/redux/api';
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

// Mock data generator function for testing
const generateMockPointsData = (userIds) => {
  // Helper to generate random integer in range
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Helper to generate random date within a semester timeframe
  const getDateForWeek = (week) => {
    // Assuming semester starts at Feb 15, 2023
    const semesterStart = new Date(2023, 1, 15);
    const daysToAdd = (week - 1) * 7 + randomInt(0, 6);
    const date = new Date(semesterStart);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString();
  };

  // Generate mock data for each user
  return {
    success: true,
    data: userIds.map((userId) => {
      // Generate mock user
      const mockUser = {
        _id: userId,
        name: `User${userId.substr(0, 4)}`,
        surname: `Surname${userId.substr(-4)}`,
        studentNumber: `ST${randomInt(10000, 99999)}`
      };

      const details = [];
      let totalPoints = 0;

      // Week 1 - All users have points
      if (Math.random() < 0.95) {
        // 95% chance
        const qcPoints = randomInt(1, 2);
        details.push({
          _id: `p${userId}w1qc`,
          points: qcPoints,
          category: 'question_creation',
          reason: 'Vytvorenie otázky v týždni 1',
          createdAt: getDateForWeek(1)
        });
        totalPoints += qcPoints;
      }

      if (Math.random() < 0.9) {
        // 90% chance
        const qvPoints = randomInt(1, 3);
        details.push({
          _id: `p${userId}w1qv`,
          points: qvPoints,
          category: 'question_validation',
          reason: 'Validácia otázky v týždni 1',
          createdAt: getDateForWeek(1)
        });
        totalPoints += qvPoints;
      }

      if (Math.random() < 0.85) {
        // 85% chance
        const qrPoints = randomInt(1, 2);
        details.push({
          _id: `p${userId}w1qr`,
          points: qrPoints,
          category: 'question_reparation',
          reason: 'Potvrdenie otázky v týždni 1',
          createdAt: getDateForWeek(1)
        });
        totalPoints += qrPoints;
      }

      // Week 2 - About half of users have points
      if (Math.random() < 0.5) {
        const categories = ['question_creation', 'question_validation', 'question_reparation'];
        const category = categories[randomInt(0, 2)];
        const points = randomInt(1, 3);
        details.push({
          _id: `p${userId}w2${category[0]}${category[9]}`,
          points: points,
          category: category,
          reason: `${category === 'question_creation' ? 'Vytvorenie' : category === 'question_validation' ? 'Validácia' : 'Potvrdenie'} otázky v týždni 2`,
          createdAt: getDateForWeek(2)
        });
        totalPoints += points;
      }

      // Week 3 - About a third of users
      if (Math.random() < 0.33) {
        const points = randomInt(2, 4);
        details.push({
          _id: `p${userId}w3qv`,
          points: points,
          category: 'question_validation',
          reason: 'Validácia otázky v týždni 3',
          createdAt: getDateForWeek(3)
        });
        totalPoints += points;
      }

      // Weeks 4-6 - Fewer users
      for (let week = 4; week <= 6; week++) {
        if (Math.random() < 0.25) {
          const categories = ['question_creation', 'question_validation', 'question_reparation'];
          const category = categories[randomInt(0, 2)];
          const points = randomInt(1, 3);
          details.push({
            _id: `p${userId}w${week}${category[0]}${category[9]}`,
            points: points,
            category: category,
            reason: `${category === 'question_creation' ? 'Vytvorenie' : category === 'question_validation' ? 'Validácia' : 'Potvrdenie'} otázky v týždni ${week}`,
            createdAt: getDateForWeek(week)
          });
          totalPoints += points;
        }
      }

      // Weeks 7-12 - Sparse data
      for (let week = 7; week <= 12; week++) {
        if (Math.random() < 0.15) {
          const categories = ['question_creation', 'question_validation', 'question_reparation'];
          const category = categories[randomInt(0, 2)];
          const points = randomInt(1, 4);
          details.push({
            _id: `p${userId}w${week}${category[0]}${category[9]}`,
            points: points,
            category: category,
            reason: `${category === 'question_creation' ? 'Vytvorenie' : category === 'question_validation' ? 'Validácia' : 'Potvrdenie'} otázky v týždni ${week}`,
            createdAt: getDateForWeek(week)
          });
          totalPoints += points;
        }
      }

      // Test points - most students have them
      if (Math.random() < 0.75) {
        const testPoints = randomInt(5, 20);
        details.push({
          _id: `p${userId}test`,
          points: testPoints,
          category: 'test',
          reason: 'Body za test',
          createdAt: getDateForWeek(10) // Around week 10
        });
        totalPoints += testPoints;
      }

      // Project points - about half students have them
      if (Math.random() < 0.5) {
        const projPoints = randomInt(10, 30);
        details.push({
          _id: `p${userId}proj`,
          points: projPoints,
          category: 'project',
          reason: 'Hodnotenie projektu',
          createdAt: getDateForWeek(12) // End of semester
        });
        totalPoints += projPoints;
      }

      // Bonus points - some students
      if (Math.random() < 0.25) {
        const bonusPoints = randomInt(1, 5);
        details.push({
          _id: `p${userId}bonus`,
          points: bonusPoints,
          category: 'bonus',
          reason: 'Bonusové body za aktivitu',
          createdAt: getDateForWeek(randomInt(1, 12))
        });
        totalPoints += bonusPoints;
      }

      return {
        user: mockUser,
        points: {
          totalPoints: totalPoints,
          details: details
        }
      };
    })
  };
};

const UserPointsModal = ({ open, onClose, userIds }) => {
  const [getUsersPointsSummary, { data: pointsData, isLoading, error }] =
    useGetUsersPointsSummaryMutation();
  const [expandedUser, setExpandedUser] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data should only be shown if real data is not available and useMockData is true
  const useMockData = false; // Set to true to enable mock data fallback
  const [mockData, setMockData] = useState(null);

  useEffect(() => {
    if (open && userIds.length > 0) {
      // Always try to get real data first
      getUsersPointsSummary(userIds);

      // Generate mock data only if enabled (but don't show it unless API fails)
      if (useMockData) {
        setMockData(generateMockPointsData(userIds));
      } else {
        setMockData(null);
      }

      // Reset pagination when modal opens with new data
      setPage(0);
    }
  }, [open, userIds, getUsersPointsSummary, useMockData]);

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

        {error && !useMockData && (
          <Box sx={{ textAlign: 'center', padding: '20px' }}>
            <Typography color="error" sx={{ fontWeight: 'bold' }}>
              Chyba pri načítavaní: {error.message}
            </Typography>
          </Box>
        )}

        {(pointsData || (error && useMockData && mockData)) && (
          <>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Celkom používateľov:{' '}
                {(pointsData ? pointsData.data : mockData ? mockData.data : []).length}
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
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 1
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 2
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 3
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 4
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 5
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 6
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 7
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 8
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 9
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 10
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 11
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        borderRight: '2px solid rgba(224, 224, 224, 1)',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        fontWeight: 'bold'
                      }}
                    >
                      Týždeň 12
                    </TableCell>
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
                    {/* Týždeň 1 */}
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
                    {/* Týždeň 2 */}
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
                    {/* Týždeň 3 */}
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
                    {/* Týždeň 4 */}
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
                    {/* Týždeň 5 */}
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
                    {/* Týždeň 6 */}
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
                    {/* Týždeň 7 */}
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
                    {/* Týždeň 8 */}
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
                    {/* Týždeň 9 */}
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
                    {/* Týždeň 10 */}
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
                    {/* Týždeň 11 */}
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
                    {/* Týždeň 12 */}
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
                    {/* Extra columns */}
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}></TableCell>
                    <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}></TableCell>
                    <TableCell sx={{ borderRight: '2px solid rgba(224, 224, 224, 1)' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Use real data if available, otherwise fallback to mock data, with pagination */}
                  {(pointsData ? pointsData.data : mockData ? mockData.data : [])
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((userData) => {
                      // Group points by week and category
                      const pointsByWeek = {};

                      // Initialize all weeks from 1 to 12
                      for (let i = 1; i <= 12; i++) {
                        pointsByWeek[i] = {
                          question_creation: 0,
                          question_validation: 0,
                          question_reparation: 0
                        };
                      }

                      // Additional categories
                      const extraPoints = {
                        test: 0,
                        project: 0,
                        bonus: 0
                      };

                      // Process details to calculate points by week and extra categories
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

                        // Extract week from the reason if possible
                        const weekMatch =
                          detail.reason?.match(/týždni (\d+)/i) ||
                          detail.reason?.match(/[Tt]ýždeň (\d+)/);

                        if (weekMatch && weekMatch[1]) {
                          const week = parseInt(weekMatch[1]);
                          if (
                            week >= 1 &&
                            week <= 12 &&
                            pointsByWeek[week] &&
                            pointsByWeek[week][detail.category]
                          ) {
                            pointsByWeek[week][detail.category] += detail.points;
                          }
                        } else if (detail.category) {
                          // If week is not specified in reason, make an educated guess based on category
                          if (detail.category === 'question_creation') {
                            pointsByWeek[1].question_creation += detail.points;
                          } else if (detail.category === 'question_validation') {
                            pointsByWeek[1].question_validation += detail.points;
                          } else if (detail.category === 'question_reparation') {
                            pointsByWeek[1].question_reparation += detail.points;
                          }
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
                            {/* Týždne 1-12 */}
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
                              <React.Fragment key={`week-${week}`}>
                                <TableCell
                                  align="center"
                                  sx={{
                                    borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                                    bgcolor: week % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                                  }}
                                >
                                  {pointsByWeek[week].question_creation || 0}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                                    bgcolor: week % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                                  }}
                                >
                                  {pointsByWeek[week].question_validation || 0}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    borderRight: '2px solid rgba(224, 224, 224, 1)',
                                    bgcolor: week % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                                  }}
                                >
                                  {pointsByWeek[week].question_reparation || 0}
                                </TableCell>
                              </React.Fragment>
                            ))}

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

                                  {/* Group points by week for better organization */}
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => {
                                    const weekPoints = userData.points.details.filter((detail) => {
                                      const weekMatch =
                                        detail.reason?.match(/týždni (\d+)/i) ||
                                        detail.reason?.match(/[Tt]ýždeň (\d+)/);
                                      return weekMatch && parseInt(weekMatch[1]) === week;
                                    });

                                    // Show all weeks, even empty ones to maintain structure
                                    const hasPoints = weekPoints.length > 0;

                                    return (
                                      <Box key={`week-details-${week}`} sx={{ mb: 2 }}>
                                        <Typography
                                          variant="subtitle1"
                                          sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}
                                        >
                                          Týždeň {week}
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
                                              {weekPoints.map((detail) => (
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
        {(pointsData || (error && useMockData && mockData)) && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={(pointsData ? pointsData.data : mockData ? mockData.data : []).length}
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
