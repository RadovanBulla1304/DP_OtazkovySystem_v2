import { useAssignUsersToProjectMutation, useGetUsersListQuery } from '@app/redux/api';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';

const AssignUsersToProject = ({ open, onClose, projectId, onSuccess }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const { data: usersData, isLoading: isUsersLoading } = useGetUsersListQuery();
  const [assignUsers, { isLoading: isAssigning }] = useAssignUsersToProjectMutation();

  const users = usersData || [];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllOnPage = (event) => {
    if (event.target.checked) {
      const pageUsers = users
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((user) => user._id);
      setSelectedUsers((prev) => [...new Set([...prev, ...pageUsers])]);
    } else {
      const pageUserIds = users
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((user) => user._id);
      setSelectedUsers((prev) => prev.filter((id) => !pageUserIds.includes(id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    try {
      await assignUsers({
        id: projectId,
        userIds: selectedUsers
      }).unwrap();
      toast.success(`${selectedUsers.length} user(s) assigned to project successfully`);
      setSelectedUsers([]);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Error assigning users to project');
    }
  };

  const handleCancel = () => {
    setSelectedUsers([]);
    setPage(0);
    onClose();
  };

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const isPageFullySelected =
    paginatedUsers.length > 0 && paginatedUsers.every((user) => selectedUsers.includes(user._id));

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Assign Users to Project</Typography>
          {selectedUsers.length > 0 && (
            <Typography variant="body2" color="primary">
              {selectedUsers.length} user(s) selected
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {isUsersLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Typography>No users available</Typography>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isPageFullySelected}
                        indeterminate={
                          paginatedUsers.some((user) => selectedUsers.includes(user._id)) &&
                          !isPageFullySelected
                        }
                        onChange={handleSelectAllOnPage}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      hover
                      onClick={() => handleSelectUser(user._id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedUsers.includes(user._id)} />
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={users.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isAssigning}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isAssigning || selectedUsers.length === 0}
        >
          {isAssigning ? <CircularProgress size={24} /> : `Assign ${selectedUsers.length} User(s)`}
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
