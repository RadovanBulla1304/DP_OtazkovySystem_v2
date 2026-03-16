import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import {
  useGetAllSubjectsQuery,
  useGetUsersListQuery,
  useGetUsersPointsSummaryMutation,
  useRemoveUserMutation
} from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, Grid2, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AddUserModal from '../../dashboard/components/AddUserModal';
import AssignToSubject from '../../dashboard/components/AssignToSubject';
import EditUserModal from '../../dashboard/components/EditUserModal';
import DeleteUserDialog from './DeleteUserDialog';
import UserDetailsDialog from './UserDetailsDialog';

const UsersList = () => {
  const { data, isLoading } = useGetUsersListQuery();
  const [removeUser] = useRemoveUserMutation();
  const [getUsersPointsSummary, { data: pointsSummaryData }] = useGetUsersPointsSummaryMutation();
  const { data: subjects = [] } = useGetAllSubjectsQuery();
  const currentSubjectId = useCurrentSubjectId();

  // State for selected users
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  // State for assign modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  // State for delete confirmation
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  // Fetch points summary when users are loaded (filtered by current subject)
  useEffect(() => {
    if (data && data.length > 0) {
      const userIds = data.map((user) => user._id);
      getUsersPointsSummary({ userIds, subjectId: currentSubjectId || undefined });
    }
  }, [data, getUsersPointsSummary, currentSubjectId]);

  // Merge users with their points data
  const usersWithPoints = useMemo(() => {
    if (!data) return [];
    if (!pointsSummaryData?.data) return data;

    // Create a map of userId -> totalPoints
    const pointsMap = {};
    pointsSummaryData.data.forEach((userPointData) => {
      // The API returns: { user: { _id, name, ... }, points: { totalPoints, details } }
      const userId = userPointData.user._id;
      pointsMap[userId] = userPointData.points.totalPoints || 0;
    });

    // Create a map of subjectId -> subject name
    const subjectMap = {};
    subjects.forEach((subject) => {
      subjectMap[subject._id] = subject.name || subject.title || 'Bez názvu';
    });

    // Merge points and subject names into user data
    return data.map((user) => {
      const assignedSubjectNames = (user.assignedSubjects || [])
        .map((subjectId) => subjectMap[subjectId] || null)
        .filter(Boolean)
        .join(', ');

      return {
        ...user,
        totalPoints: pointsMap[user._id] || 0,
        subjectNames: assignedSubjectNames || '-'
      };
    });
  }, [data, pointsSummaryData, subjects]);

  const onRemoveHandler = async (user) => {
    try {
      setIsDeleting(true);
      const response = await removeUser(user._id);
      if (!response.error) {
        toast.success('Používateľ bol úspešne odstránený');
      } else {
        toast.error('Chyba pri odstraňovaní používateľa: ' + response.error?.data?.message);
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      toast.error('Chyba pri odstraňovaní používateľa');
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  // Columns definition similar to TeacherList, but for users (students)
  const columns = [
    { field: 'name', headerName: 'Meno', flex: 1, minWidth: 150 },
    { field: 'surname', headerName: 'Priezvisko', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'groupNumber', headerName: 'Skupina', flex: 1, minWidth: 100 },
    { field: 'studentNumber', headerName: 'Študentské číslo', flex: 1, minWidth: 120 },
    {
      field: 'subjectNames',
      headerName: 'Predmety',
      flex: 1.5,
      minWidth: 150,
      valueGetter: (value, row) => row.subjectNames || '-'
    },
    {
      field: 'totalPoints',
      headerName: 'Body',
      flex: 1,
      minWidth: 80,
      valueGetter: (value, row) => row.totalPoints ?? 0
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Akcie',
      minWidth: 170,
      flex: 0.8,
      getActions: (params) => [
        <Tooltip key={'details'} title="Zobraziť detail">
          <IconButton
            color="info"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openUserDetails(params.row);
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>,
        <EditUserModal key={'edit'} userData={params.row} isTeacher={false} />,
        <Tooltip key={'delete'} title="Odstrániť používateľa">
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              setUserToDelete(params.row);
            }}
            disabled={isDeleting}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ]
    }
  ];

  const openUserDetails = (row) => {
    if (!row) return;
    setSelectedUserForDetails(row);
    setDetailsOpen(true);
  };

  const handleRowDoubleClick = (params) => {
    openUserDetails(params?.row);
  };

  const handleCellDoubleClick = (params) => {
    // Ignore double-clicks on checkbox and action cells.
    if (params.field === '__check__' || params.field === 'actions') return;
    openUserDetails(params?.row);
  };

  // Handler for opening assign modal
  const handleOpenAssignModal = () => {
    setAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
  };

  const handleAssignSuccess = () => {
    setSelectedUserIds([]);
  };

  return (
    <Box>
      <Grid2 container spacing={1} justifyContent={'flex-end'}>
        <Grid2
          display={'flex'}
          width={'100%'}
          justifyContent={'space-between'}
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={{ xs: 2, sm: 1 }}
        >
          <Typography
            variant="h4"
            alignSelf={'center'}
            sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            Používatelia
          </Typography>
          <Grid2
            size={{ xs: 12, sm: 6 }}
            justifyContent={'flex-end'}
            display={'flex'}
            gap={1}
            flexDirection={{ xs: 'column', sm: 'row' }}
          >
            <Button
              variant="outlined"
              color="primary"
              disabled={selectedUserIds.length === 0}
              onClick={handleOpenAssignModal}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Priraď k predmetu
            </Button>
            <AddUserModal />
          </Grid2>
        </Grid2>
      </Grid2>
      <Paper sx={{ mt: 2, overflowX: 'auto' }}>
        <DataGrid
          loading={isLoading}
          rows={usersWithPoints}
          columns={columns}
          sx={{ minWidth: { xs: 920, md: '100%' } }}
          getRowId={(row) => row._id}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            density: 'compact',
            pagination: {
              paginationModel: {
                pageSize: 20
              }
            }
          }}
          checkboxSelection
          isRowSelectable={() => true}
          onRowSelectionModelChange={(ids) => setSelectedUserIds(ids)}
          rowSelectionModel={selectedUserIds}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          ignoreDiacritics
          onRowDoubleClick={handleRowDoubleClick}
          onCellDoubleClick={handleCellDoubleClick}
        />
      </Paper>
      <AssignToSubject
        open={assignModalOpen}
        onClose={handleCloseAssignModal}
        userIds={selectedUserIds}
        onSuccess={handleAssignSuccess}
      />

      {/* Confirmation Dialog for Delete User */}
      <DeleteUserDialog
        open={!!userToDelete}
        user={userToDelete}
        isDeleting={isDeleting}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => onRemoveHandler(userToDelete)}
      />

      <UserDetailsDialog
        open={detailsOpen}
        user={selectedUserForDetails}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedUserForDetails(null);
        }}
      />
    </Box>
  );
};

export default UsersList;
