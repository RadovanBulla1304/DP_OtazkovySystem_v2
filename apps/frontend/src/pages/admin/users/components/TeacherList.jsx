import ConfirmationDialog from '@app/components/ConfirmationDialog';
import CenteredCheckIcon from '@app/components/table/CenteredCheckIcon';
import { useGetAllTeachersQuery, useRemoveTeacherMutation } from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import EditUserModal from '../../dashboard/components/EditUserModal';

const TeacherList = () => {
  const { data = [], isLoading } = useGetAllTeachersQuery();
  const [removeTeacher] = useRemoveTeacherMutation();

  const onRemoveHandler = async (id) => {
    const response = await removeTeacher(id);
    if (!response.error) {
      toast.success('Učiteľ bol úspešne odstránený');
    } else {
      toast.error('Chyba pri odstraňovaní učiteľa: ' + response.error?.data?.message);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Meno', flex: 1, minWidth: 150 },
    { field: 'surname', headerName: 'Priezvisko', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'is_admin',
      headerName: 'Admin účet',
      flex: 1,
      renderCell: (value) => (value.row.isAdmin ? <CenteredCheckIcon /> : null)
    },
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
        <EditUserModal key={'edit'} userData={params.row} isTeacher={true} />, // teacher
        <ConfirmationDialog
          key={'delete'}
          title={`Naozaj chcete odstrániť učiteľa ${params.row.name} ${params.row.surname}?`}
          onAccept={() => onRemoveHandler(params.row._id)}
        >
          <Tooltip title="Odstráň učiteľa">
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </ConfirmationDialog>
      ]
    }
  ];

  return (
    <>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Učitelia
      </Typography>
      <Paper>
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
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          ignoreDiacritics
        />
      </Paper>
    </>
  );
};

export default TeacherList;
