import ConfirmationDialog from '@app/components/ConfirmationDialog';
import CenteredCheckIcon from '@app/components/table/CenteredCheckIcon';
import { useGetUsersListQuery, useRemoveUserMutation } from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Grid2, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useState } from 'react';
import { toast } from 'react-toastify';
import AddUserModal from '../components/AddUserModal';
import AssignToSubject from '../components/AssignToSubject';
import EditUserModal from '../components/EditUserModal';

const UsersList = () => {
  const { data, isLoading } = useGetUsersListQuery();
  const [removeUser] = useRemoveUserMutation();

  // State for selected users
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  // State for assign modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const onRemoveHandler = async (id) => {
    const response = await removeUser(id);
    if (!response.error) {
      toast.success('Užívateľ bol úspešne odstránený');
    } else {
      toast.error('Chyba pri odstraňovaní užívateľa: ' + response.error?.data?.message);
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
      field: 'is_active',
      headerName: 'Účet aktívny',
      flex: 1,
      renderCell: (value) => (value.row.isActive ? <CenteredCheckIcon /> : null)
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Akcie',
      getActions: (params) => [
        <EditUserModal key={'edit'} userData={params.row} isTeacher={false} />, // user
        <ConfirmationDialog
          key={'delete'}
          title={`Naozaj chcete odstranit pouzivatela ${params.row.name} ${params.row.surname} ?`}
          onAccept={() => onRemoveHandler(params.row._id)}
        >
          <Tooltip title="Odstran pouzivatela">
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </ConfirmationDialog>
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

  // ...columns are now defined above...

  return (
    <Box py={2}>
      <Grid2 py={1} px={1} container spacing={1}>
        <Grid2 size={{ xs: 12, sm: 9 }} display={'flex'}>
          <Typography variant="h4" alignSelf={'center'}>
            Používatelia
          </Typography>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 3 }} justifyContent={'flex-end'} display={'flex'} gap={1}>
          <Button
            variant="outlined"
            color="primary"
            disabled={selectedUserIds.length === 0}
            sx={{ m: 1, minWidth: 150 }}
            onClick={handleOpenAssignModal}
          >
            Priraď k predmetu
          </Button>
          <AddUserModal />
        </Grid2>
      </Grid2>
      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={data}
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
    </Box>
  );
};

export default UsersList;
