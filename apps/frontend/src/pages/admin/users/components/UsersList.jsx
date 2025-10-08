import {
  useGetAllSubjectsQuery,
  useGetUsersListQuery,
  useGetUsersPointsSummaryMutation,
  useRemoveUserMutation
} from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AddUserModal from '../../dashboard/components/AddUserModal';
import AssignToSubject from '../../dashboard/components/AssignToSubject';
import EditUserModal from '../../dashboard/components/EditUserModal';
import UserPointsModal from '../../dashboard/components/UserPointsModal';

const UsersList = () => {
  const { data, isLoading } = useGetUsersListQuery();
  const [removeUser] = useRemoveUserMutation();
  const [getUsersPointsSummary, { data: pointsSummaryData }] = useGetUsersPointsSummaryMutation();
  const { data: subjects = [] } = useGetAllSubjectsQuery();

  // State for selected users
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  // State for assign modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  // State for points modal
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  // State for delete confirmation
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch points summary when users are loaded
  useEffect(() => {
    if (data && data.length > 0) {
      const userIds = data.map((user) => user._id);
      getUsersPointsSummary(userIds);
    }
  }, [data, getUsersPointsSummary]);

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
      console.log(userPointData);
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
      getActions: (params) => [
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

  const handleRowClick = (params) => {
    // NOTE: ak chceme na dvojklik nejaku aktivitu
    console.log(params);
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

  // Handler for opening points modal
  const handleOpenPointsModal = () => {
    if (selectedUserIds.length === 0) {
      toast.warn('Vyberte aspoň jedného používateľa');
      return;
    }
    setPointsModalOpen(true);
  };

  const handleClosePointsModal = () => {
    setPointsModalOpen(false);
  };

  return (
    <Box>
      <Grid2 container spacing={1} justifyContent={'flex-end'}>
        <Grid2 display={'flex'} width={'100%'} justifyContent={'space-between'}>
          <Typography variant="h4" alignSelf={'center'}>
            Používatelia
          </Typography>
          <Grid2 size={{ xs: 12, sm: 6 }} justifyContent={'flex-end'} display={'flex'} gap={1}>
            <Button
              variant="outlined"
              color="primary"
              disabled={selectedUserIds.length === 0}
              onClick={handleOpenAssignModal}
            >
              Priraď k predmetu
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              disabled={selectedUserIds.length === 0}
              onClick={handleOpenPointsModal}
            >
              Zobraziť body
            </Button>
            <AddUserModal />
          </Grid2>
        </Grid2>
      </Grid2>
      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={usersWithPoints}
          columns={columns}
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
          onRowDoubleClick={handleRowClick}
        />
      </Paper>
      <AssignToSubject
        open={assignModalOpen}
        onClose={handleCloseAssignModal}
        userIds={selectedUserIds}
        onSuccess={handleAssignSuccess}
      />
      <UserPointsModal
        open={pointsModalOpen}
        onClose={handleClosePointsModal}
        userIds={selectedUserIds}
      />

      {/* Confirmation Dialog for Delete User */}
      {userToDelete && (
        <Dialog
          open={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          aria-labelledby="delete-user-dialog-title"
          aria-describedby="delete-user-dialog-description"
        >
          <DialogTitle id="delete-user-dialog-title">Vymazať používateľa?</DialogTitle>
          <DialogContent>
            <Typography id="delete-user-dialog-description">
              Naozaj chcete odstrániť používateľa{' '}
              <strong>
                {userToDelete.name} {userToDelete.surname}
              </strong>
              ? Táto akcia je nevratná.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserToDelete(null)} variant="outlined" disabled={isDeleting}>
              Zrušiť
            </Button>
            <Button
              onClick={() => onRemoveHandler(userToDelete)}
              color="error"
              variant="contained"
              disabled={isDeleting}
            >
              {isDeleting ? 'Mazanie...' : 'Vymazať'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default UsersList;
