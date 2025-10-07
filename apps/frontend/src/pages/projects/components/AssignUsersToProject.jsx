import { useAssignUsersToProjectMutation, useGetUsersListQuery } from '@app/redux/api';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';

const AssignUsersToProject = ({ open, onClose, projectId, onSuccess }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const { data: usersData, isLoading: isUsersLoading } = useGetUsersListQuery();
  const [assignUsers, { isLoading: isAssigning }] = useAssignUsersToProjectMutation();

  const users = usersData || [];

  // Define columns for the DataGrid
  const columns = [
    { field: 'name', headerName: 'Meno', flex: 1, minWidth: 150 },
    { field: 'surname', headerName: 'Priezvisko', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'username', headerName: 'Používateľské meno', flex: 1, minWidth: 150 },
    { field: 'studentNumber', headerName: 'Študentské číslo', flex: 1, minWidth: 120 },
    { field: 'groupNumber', headerName: 'Skupina', flex: 1, minWidth: 100 }
  ];

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Vyberte aspoň jedného používateľa');
      return;
    }

    try {
      await assignUsers({
        id: projectId,
        userIds: selectedUsers
      }).unwrap();
      toast.success(`${selectedUsers.length} používateľ(ov) úspešne priradených k projektu`);
      setSelectedUsers([]);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Chyba pri priraďovaní používateľov k projektu');
    }
  };

  const handleCancel = () => {
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Priradiť používateľov k projektu</Typography>
          {selectedUsers.length > 0 && (
            <Typography variant="body2" color="primary">
              {selectedUsers.length} používateľ(ov) vybratých
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ height: 500, p: 2 }}>
        <DataGrid
          loading={isUsersLoading}
          rows={users}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            density: 'compact',
            pagination: {
              paginationModel: {
                pageSize: 10
              }
            }
          }}
          checkboxSelection
          isRowSelectable={() => true}
          onRowSelectionModelChange={(ids) => setSelectedUsers(ids)}
          rowSelectionModel={selectedUsers}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          ignoreDiacritics
          disableRowSelectionOnClick
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isAssigning} variant="outlined">
          Zrušiť
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isAssigning || selectedUsers.length === 0}
        >
          {isAssigning ? (
            <CircularProgress size={24} />
          ) : (
            `Priradiť ${selectedUsers.length} používateľ(ov)`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AssignUsersToProject.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.string,
  onSuccess: PropTypes.func
};

export default AssignUsersToProject;
