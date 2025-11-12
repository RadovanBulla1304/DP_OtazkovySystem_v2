import CenteredCheckIcon from '@app/components/table/CenteredCheckIcon';
import * as authService from '@app/pages/auth/authService';
import { useGetAllTeachersQuery, useRemoveTeacherMutation } from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useState } from 'react';
import { toast } from 'react-toastify';
import EditUserModal from '../../dashboard/components/EditUserModal';
import DeleteTeacherDialog from './DeleteTeacherDialog';

const TeacherList = () => {
  const { data = [], isLoading } = useGetAllTeachersQuery();
  const [removeTeacher] = useRemoveTeacherMutation();
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current logged-in user to check if they are admin
  const currentUser = authService.getUserFromStorage() || authService.getTeacherFromStorage();
  const isCurrentUserAdmin = currentUser?.isAdmin || false;

  const onRemoveHandler = async (teacher) => {
    try {
      setIsDeleting(true);
      const response = await removeTeacher(teacher._id);
      if (!response.error) {
        toast.success('Učiteľ bol úspešne odstránený');
      } else {
        toast.error('Chyba pri odstraňovaní učiteľa: ' + response.error?.data?.message);
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      toast.error('Chyba pri odstraňovaní učiteľa');
    } finally {
      setIsDeleting(false);
      setTeacherToDelete(null);
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
    // Only include actions column if current user is admin
    ...(isCurrentUserAdmin
      ? [
          {
            field: 'actions',
            type: 'actions',
            headerName: 'Akcie',
            getActions: (params) => [
              <EditUserModal key={'edit'} userData={params.row} isTeacher={true} />,
              <Tooltip key={'delete'} title="Odstrániť učiteľa">
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTeacherToDelete(params.row);
                  }}
                  disabled={isDeleting}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            ]
          }
        ]
      : [])
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

      {/* Confirmation Dialog for Delete Teacher */}
      <DeleteTeacherDialog
        open={!!teacherToDelete}
        teacher={teacherToDelete}
        isDeleting={isDeleting}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={() => onRemoveHandler(teacherToDelete)}
      />
    </>
  );
};

export default TeacherList;
