import { useAssignUsersToProjectMutation, useGetUsersAssignedToSubjectQuery } from '@app/redux/api';
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
import { skipToken } from '@reduxjs/toolkit/query';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCurrentSubjectId } from '../../../hooks/useCurrentSubjectId';

const AssignUsersToProject = ({ open, onClose, projectId, onSuccess }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Get current subjectId from custom hook
  const subjectId = useCurrentSubjectId();
  // Fetch users assigned to the subject
  const { data: usersData, isLoading: isUsersLoading } = useGetUsersAssignedToSubjectQuery(
    subjectId ? { subjectId } : skipToken
  );
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

  // Show loading spinner if subject or users are loading
  const isLoading = !subjectId || isUsersLoading;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          mx: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexDirection={{ xs: 'column', sm: 'row' }}
          flexWrap="wrap"
          gap={1}
        >
          <Typography variant="h6" component="span" sx={{ fontWeight: 600, p: 0 }}>
            Priradiť používateľov k projektu
          </Typography>
          {selectedUsers.length > 0 && (
            <Typography variant="body2" color="primary">
              {selectedUsers.length} používateľ(ov) vybratých
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ height: { xs: 420, sm: 500 }, p: { xs: 1.25, sm: 2 } }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={users}
            columns={columns}
            sx={{ minWidth: { xs: 760, md: '100%' } }}
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
        )}
      </DialogContent>
      <DialogActions
        disableSpacing
        sx={{
          flexWrap: 'wrap',
          gap: 1,
          px: { xs: 2, sm: 3 },
          pb: 2,
          justifyContent: { xs: 'stretch', sm: 'flex-end' }
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={isAssigning}
          variant="outlined"
          color="error"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Zrušiť
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isAssigning || selectedUsers.length === 0}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
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
