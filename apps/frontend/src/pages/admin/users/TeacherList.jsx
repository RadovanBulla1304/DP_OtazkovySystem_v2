import CenteredCheckIcon from '@app/components/table/CenteredCheckIcon';
import { useGetAllTeachersQuery } from '@app/redux/api';
import { Paper, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const TeacherList = () => {
  const { data = [], isLoading } = useGetAllTeachersQuery();

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
