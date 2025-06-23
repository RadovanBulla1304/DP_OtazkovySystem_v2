import {
  useDeleteAllModulsBySubjectMutation,
  useDeleteModulMutation,
  useDeleteSubjectMutation,
  useGetModulsBySubjectQuery,
  useGetSubjectByIdQuery,
  useGetUsersListQuery,
  useUnasignUserFromSubjectMutation
} from '@app/redux/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddModulModal from '../admin/components/AddModulModal';
import EditModulModal from '../admin/components/EditModulModal';
import EditSubjectModal from '../admin/components/EditSubjectModal';

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  // Delete mutations
  const [deleteSubject] = useDeleteSubjectMutation();
  const [deleteAllModulsBySubject] = useDeleteAllModulsBySubjectMutation();
  const [deleteModul] = useDeleteModulMutation();
  const [unasignUserFromSubject, { isLoading: isUnassigning }] =
    useUnasignUserFromSubjectMutation();

  // State for modals and dialogs
  const [isModulModalOpen, setIsModulModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editModulModalOpen, setEditModulModalOpen] = useState(false);
  const [modulToEdit, setModulToEdit] = useState(null);

  // Modul delete dialog state
  const [modulToDelete, setModulToDelete] = useState(null);
  const [isDeleteModulDialogOpen, setIsDeleteModulDialogOpen] = useState(false);
  const [isDeletingModul, setIsDeletingModul] = useState(false);

  // Assigned users selection state
  const [selectedAssignedUserIds, setSelectedAssignedUserIds] = useState([]);

  // Fetch subject details
  const {
    data: subject,
    isLoading: isSubjectLoading,
    isError: isSubjectError,
    refetch: refetchSubject
  } = useGetSubjectByIdQuery(subjectId);

  // Fetch modules for this subject
  const {
    data: modules = [],
    isLoading: isModulesLoading,
    isError: isModulesError,
    refetch: refetchModules
  } = useGetModulsBySubjectQuery(subjectId);

  // Fetch all users for assigned users table
  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError
  } = useGetUsersListQuery();

  // Prepare assigned users info
  const assignedUsersInfo = useMemo(() => {
    if (!subject || !users) return [];
    return (subject.assignedUsers || [])
      .map((userId) => users.find((u) => u._id === userId))
      .filter(Boolean);
  }, [subject, users]);

  // Handlers for modul modal
  const handleOpenModulModal = () => setIsModulModalOpen(true);
  const handleCloseModulModal = () => setIsModulModalOpen(false);

  const handleModulCreated = async () => {
    try {
      await refetchSubject();
      await refetchModules();
      handleCloseModulModal();
    } catch (error) {
      console.error('Error handling modul creation:', error);
    }
  };

  // Edit subject modal handlers
  const handleEditSubject = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);
  const handleEditSuccess = async () => {
    await refetchSubject();
    setIsEditModalOpen(false);
  };

  // Confirm delete subject dialog handlers
  const handleOpenDeleteDialog = () => setIsDeleteDialogOpen(true);
  const handleCloseDeleteDialog = () => setIsDeleteDialogOpen(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // First delete all modules of this subject
      const modulesResponse = await deleteAllModulsBySubject(subjectId);

      if (modulesResponse.error) {
        console.error('Error deleting modules:', modulesResponse.error);
        alert('Chyba pri odstraňovaní modulov.');
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        return;
      }

      // Then delete the subject
      const subjectResponse = await deleteSubject(subjectId);

      if (subjectResponse.error) {
        console.error('Error deleting subject:', subjectResponse.error);
        alert('Chyba pri odstraňovaní predmetu.');
      } else {
        alert('Predmet a všetky jeho moduly boli úspešne odstránené.');
        navigate('/subjects');
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      alert('Chyba pri odstraňovaní predmetu a modulov.');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Edit modul modal handlers
  const handleOpenEditModulModal = (modul) => {
    setModulToEdit(modul);
    setEditModulModalOpen(true);
  };
  const handleCloseEditModulModal = () => {
    setEditModulModalOpen(false);
    setModulToEdit(null);
  };
  const handleEditModulSuccess = async () => {
    await refetchModules();
    setEditModulModalOpen(false);
    setModulToEdit(null);
  };

  // Delete modul handlers
  const handleOpenDeleteModulDialog = (modul) => {
    setModulToDelete(modul);
    setIsDeleteModulDialogOpen(true);
  };
  const handleCloseDeleteModulDialog = () => {
    setIsDeleteModulDialogOpen(false);
    setModulToDelete(null);
  };
  const handleConfirmDeleteModul = async () => {
    setIsDeletingModul(true);
    try {
      await deleteModul(modulToDelete._id).unwrap();
      toast.success('Modul bol úspešne odstránený');
      await refetchModules();
    } catch (error) {
      toast.error('Chyba pri odstraňovaní modulu', error);
    } finally {
      setIsDeletingModul(false);
      setIsDeleteModulDialogOpen(false);
      setModulToDelete(null);
    }
  };

  // Unassign users handler
  const handleUnassignUsers = async () => {
    if (!selectedAssignedUserIds.length) return;
    try {
      await unasignUserFromSubject({
        subjectId,
        userId:
          selectedAssignedUserIds.length === 1
            ? selectedAssignedUserIds[0]
            : selectedAssignedUserIds
      }).unwrap();
      toast.success('Používateľ(ia) boli odobraní z predmetu');
      setSelectedAssignedUserIds([]);
      await refetchSubject();
    } catch (error) {
      toast.error('Chyba pri odoberaní používateľov z predmetu', error);
    }
  };

  // Define columns for the modules table
  const columns = [
    {
      field: 'title',
      headerName: 'Názov modulu',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'date_start',
      headerName: 'Začiatok',
      flex: 1,
      headerAlign: 'center',
      renderCell: (params) => {
        return params.row?.date_start ? dayjs(params.row.date_start).format('DD.MM.YYYY') : '-';
      }
    },
    {
      field: 'date_end',
      headerName: 'Koniec',
      flex: 1,
      headerAlign: 'center',
      renderCell: (params) => {
        return params.row?.date_end ? dayjs(params.row.date_end).format('DD.MM.YYYY') : '-';
      }
    },
    {
      field: 'duration_days',
      headerName: 'Trvanie (dni)',
      flex: 1,
      headerAlign: 'center',
      renderCell: (params) => {
        return params.row?.duration_days !== undefined ? params.row.duration_days : '-';
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Akcie',
      getActions: (params) => [
        <Tooltip key="edit" title="Upraviť modul">
          <IconButton color="primary" onClick={() => handleOpenEditModulModal(params.row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>,
        <Tooltip key="delete" title="Odstrániť modul">
          <IconButton color="error" onClick={() => handleOpenDeleteModulDialog(params.row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ]
    }
  ];

  // Columns for assigned users DataGrid
  const assignedUsersColumns = [
    { field: 'name', headerName: 'Meno', flex: 1, minWidth: 120 },
    { field: 'surname', headerName: 'Priezvisko', flex: 1, minWidth: 120 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    {
      field: 'isAdmin',
      headerName: 'Admin účet',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (params.row.isAdmin ? 'Áno' : 'Nie')
    },
    {
      field: 'isActive',
      headerName: 'Aktívny účet',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (params.row.isActive ? 'Áno' : 'Nie')
    }
  ];

  if (isSubjectLoading || isModulesLoading || isDeleting || isUsersLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (isSubjectError || isModulesError || isUsersError) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">Chyba pri načítaní údajov</Typography>
      </Box>
    );
  }

  if (!subject) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Predmet nebol nájdený</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '20px' }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/subjects" underline="hover" color="inherit">
          Predmety
        </Link>
        <Typography color="text.primary">{subject.name}</Typography>
      </Breadcrumbs>

      {/* Subject details card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Typography variant="h4" component="h1">
              {subject.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Pridať modul">
                <IconButton
                  color="primary"
                  onClick={handleOpenModulModal}
                  sx={{
                    border: '1px solid',
                    borderRadius: '50%',
                    padding: 0.5,
                    borderColor: 'primary.main'
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Upraviť predmet">
                <IconButton color="secondary" onClick={handleEditSubject}>
                  <EditIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Vymazať predmet">
                <IconButton color="error" onClick={handleOpenDeleteDialog}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                ID: {subject._id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vytvorené: {dayjs(subject.createdAt).format('DD.MM.YYYY')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Počet modulov: {subject.moduls?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Počet priradených používateľov: {subject.assignedUsers?.length || 0}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Modules table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Moduly predmetu
        </Typography>

        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={modules}
            columns={columns}
            getRowId={(row) => row._id || Math.random().toString()}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              },
              sorting: {
                sortModel: [{ field: 'date_start', sort: 'desc' }]
              }
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 }
              }
            }}
            disableRowSelectionOnClick
          />
        </Paper>
      </Box>

      {/* Assigned Users Table */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Priradení používatelia</Typography>
          <Button
            variant="contained"
            color="error"
            disabled={selectedAssignedUserIds.length === 0 || isUnassigning}
            onClick={handleUnassignUsers}
          >
            Odstrániť priradenie používateľov
          </Button>
        </Box>
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={assignedUsersInfo}
            columns={assignedUsersColumns}
            getRowId={(row) => row._id}
            checkboxSelection
            isRowSelectable={() => true}
            onRowSelectionModelChange={(ids) => setSelectedAssignedUserIds(ids)}
            rowSelectionModel={selectedAssignedUserIds}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 }
              }
            }}
          />
        </Paper>
      </Box>

      {/* Add Module Modal */}
      <AddModulModal
        open={isModulModalOpen}
        onClose={handleCloseModulModal}
        subjectId={subjectId}
        onCreated={handleModulCreated}
      />
      {/* Edit Modul Modal */}
      <EditModulModal
        open={editModulModalOpen}
        onClose={handleCloseEditModulModal}
        onSuccess={handleEditModulSuccess}
        modul={modulToEdit}
      />

      {/* Edit Subject Modal */}
      <EditSubjectModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
        subject={subject}
      />

      {/* Confirmation Dialog for Delete Subject */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-subject-dialog-title"
        aria-describedby="delete-subject-dialog-description"
      >
        <DialogTitle id="delete-subject-dialog-title">Vymazať predmet?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-subject-dialog-description">
            Naozaj chcete odstrániť predmet <strong>{subject.name}</strong> a všetky jeho moduly?
            Táto akcia je nevratná.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Zrušiť
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Mazanie...' : 'Vymazať'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Delete Modul */}
      <Dialog
        open={isDeleteModulDialogOpen}
        onClose={handleCloseDeleteModulDialog}
        aria-labelledby="delete-modul-dialog-title"
        aria-describedby="delete-modul-dialog-description"
      >
        <DialogTitle id="delete-modul-dialog-title">Vymazať modul?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-modul-dialog-description">
            Naozaj chcete odstrániť modul <strong>{modulToDelete?.title}</strong>? Táto akcia je
            nevratná.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModulDialog} disabled={isDeletingModul}>
            Zrušiť
          </Button>
          <Button
            onClick={handleConfirmDeleteModul}
            color="error"
            variant="contained"
            disabled={isDeletingModul}
          >
            {isDeletingModul ? 'Mazanie...' : 'Vymazať'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectDetail;
