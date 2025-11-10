import {
  useDeleteAllModulsBySubjectMutation,
  useDeleteModulMutation,
  useDeleteSubjectMutation,
  useGetAllTeachersQuery,
  useGetModulsBySubjectQuery,
  useGetSubjectByIdQuery,
  useGetTeacherMeQuery,
  useGetUsersListQuery,
  useUnasignUserFromSubjectMutation
} from '@app/redux/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PeopleIcon from '@mui/icons-material/People';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
import AddModulModal from './components/AddModulModal';
import AssignTeachersToSubject from './components/AssignTeachersToSubject';
import AssignUsersFromCSVModal from './components/AssignUsersFromCSVModal';
import DeleteModulDialog from './components/DeleteModulDialog';
import DeleteSubjectDialog from './components/DeleteSubjectDialog';
import EditModulModal from './components/EditModulModal';
import EditSubjectModal from './components/EditSubjectModal';
import UnassignUsersDialog from './components/UnassignUsersDialog';

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
  const [isManageTeachersOpen, setIsManageTeachersOpen] = useState(false);

  const [editModulModalOpen, setEditModulModalOpen] = useState(false);
  const [modulToEdit, setModulToEdit] = useState(null);

  // Modul delete dialog state
  const [modulToDelete, setModulToDelete] = useState(null);
  const [isDeleteModulDialogOpen, setIsDeleteModulDialogOpen] = useState(false);
  const [isDeletingModul, setIsDeletingModul] = useState(false);

  // Assigned users selection state
  const [selectedAssignedUserIds, setSelectedAssignedUserIds] = useState([]);

  // CSV upload modal state
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  // Unassign users dialog state
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);

  // Fetch subject details
  const {
    data: subject,
    isLoading: isSubjectLoading,
    isError: isSubjectError,
    refetch: refetchSubject
  } = useGetSubjectByIdQuery(subjectId);

  // Fetch teachers
  const { data: allTeachers = [] } = useGetAllTeachersQuery();

  // Get current teacher to check permissions
  const { data: currentTeacher } = useGetTeacherMeQuery();

  // Check if current teacher can manage this subject
  const canManageSubject = currentTeacher?.isAdmin || currentTeacher?._id === subject?.createdBy;

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
    return (subject.assigned_students || [])
      .map((userId) => users.find((u) => u._id === userId))
      .filter(Boolean);
  }, [subject, users]);

  // Handlers for modul modal
  const handleOpenModulModal = () => setIsModulModalOpen(true);
  const handleCloseModulModal = () => setIsModulModalOpen(false);

  const handleModulCreated = async () => {
    await refetchModules();
    await refetchSubject(); // always refetch subject right here
    handleCloseModulModal();
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
        toast.error(
          'Chyba pri odstraňovaní modulov: ' +
            (modulesResponse.error?.data?.message || 'Neznáma chyba')
        );
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        return;
      }

      // Then delete the subject
      const subjectResponse = await deleteSubject(subjectId);

      if (subjectResponse.error) {
        console.error('Error deleting subject:', subjectResponse.error);
        toast.error(
          'Chyba pri odstraňovaní predmetu: ' +
            (subjectResponse.error?.data?.message || 'Neznáma chyba')
        );
      } else {
        toast.success('Predmet a všetky jeho moduly boli úspešne odstránené');
        // Navigate back to subjects with a timestamp to force refresh
        navigate('/subjects', { replace: true, state: { refresh: Date.now() } });
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      toast.error('Chyba pri odstraňovaní predmetu a modulov');
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
      await refetchSubject(); // Refresh subject to update module count
    } catch (error) {
      toast.error('Chyba pri odstraňovaní modulu', error);
    } finally {
      setIsDeletingModul(false);
      setIsDeleteModulDialogOpen(false);
      setModulToDelete(null);
    }
  };

  // Unassign users handler
  const handleOpenUnassignDialog = () => {
    if (!selectedAssignedUserIds.length) {
      toast.warn('Vyberte aspoň jedného používateľa');
      return;
    }
    setIsUnassignDialogOpen(true);
  };

  const handleCloseUnassignDialog = () => {
    setIsUnassignDialogOpen(false);
  };

  const handleConfirmUnassignUsers = async () => {
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
      setIsUnassignDialogOpen(false);
    } catch (error) {
      toast.error('Chyba pri odoberaní používateľov z predmetu', error);
      setIsUnassignDialogOpen(false);
    }
  };

  // CSV modal handlers
  const handleOpenCSVModal = () => setIsCSVModalOpen(true);
  const handleCloseCSVModal = () => setIsCSVModalOpen(false);
  const handleCSVAssignSuccess = async () => {
    await refetchSubject();
    setIsCSVModalOpen(false);
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
    <Box sx={{ paddingBlock: '24px' }}>
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
              {canManageSubject && (
                <>
                  <Tooltip title="Spravovať učiteľov">
                    <IconButton color="primary" onClick={() => setIsManageTeachersOpen(true)}>
                      <PeopleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Priradiť používateľov z CSV">
                    <IconButton onClick={handleOpenCSVModal}>
                      <UploadFileIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Upraviť predmet">
                    <IconButton color="primary" onClick={handleEditSubject}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Vymazať predmet">
                    <IconButton color="error" onClick={handleOpenDeleteDialog}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
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
                Počet modulov: {modules.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Počet priradených používateľov: {subject.assigned_students?.length || 0}
              </Typography>
            </Grid>

            {/* Assigned Teachers Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              {/* Creator Teacher */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Vytvorené učiteľom:
                </Typography>
                {subject.createdBy && subject.assigned_teachers ? (
                  (() => {
                    const creatorData =
                      typeof subject.createdBy === 'string'
                        ? allTeachers.find((t) => t._id === subject.createdBy)
                        : subject.createdBy;
                    return creatorData ? (
                      <Chip
                        key={creatorData._id}
                        label={`${creatorData.name} ${creatorData.surname}`}
                        color="secondary"
                        variant="filled"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Neznámy
                      </Typography>
                    );
                  })()
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Neznámy
                  </Typography>
                )}
              </Box>

              {/* Assigned Teachers */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Priradení učitelia:
                </Typography>
                {subject.assigned_teachers && subject.assigned_teachers.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {subject.assigned_teachers
                      .filter((teacher) => {
                        const teacherId = typeof teacher === 'string' ? teacher : teacher._id;
                        return teacherId !== subject.createdBy;
                      })
                      .map((teacher) => {
                        const teacherData =
                          typeof teacher === 'string'
                            ? allTeachers.find((t) => t._id === teacher)
                            : teacher;

                        return teacherData ? (
                          <Chip
                            key={teacherData._id}
                            label={`${teacherData.name} ${teacherData.surname}`}
                            color="primary"
                            variant="outlined"
                          />
                        ) : null;
                      })}
                  </Box>
                ) : null}
                {(!subject.assigned_teachers ||
                  subject.assigned_teachers.filter((teacher) => {
                    const teacherId = typeof teacher === 'string' ? teacher : teacher._id;
                    return teacherId !== subject.createdBy;
                  }).length === 0) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Žiadni ďalší učitelia
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Modules table */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Moduly predmetu</Typography>
          <Button variant="contained" color="primary" onClick={handleOpenModulModal}>
            + Nový Modul
          </Button>
        </Box>

        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={modules}
            columns={columns}
            density="compact"
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
            onClick={handleOpenUnassignDialog}
          >
            Odstrániť priradenie používateľov
          </Button>
        </Box>
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={assignedUsersInfo}
            columns={assignedUsersColumns}
            density="compact"
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

      {/* CSV Upload Modal */}
      <AssignUsersFromCSVModal
        open={isCSVModalOpen}
        onClose={handleCloseCSVModal}
        subjectId={subjectId}
        onSuccess={handleCSVAssignSuccess}
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
      <DeleteSubjectDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        subject={subject}
        isDeleting={isDeleting}
      />

      {/* Confirmation Dialog for Delete Modul */}
      <DeleteModulDialog
        open={isDeleteModulDialogOpen}
        onClose={handleCloseDeleteModulDialog}
        onConfirm={handleConfirmDeleteModul}
        modul={modulToDelete}
        isDeleting={isDeletingModul}
      />

      {/* Confirmation Dialog for Unassign Users */}
      <UnassignUsersDialog
        open={isUnassignDialogOpen}
        userCount={selectedAssignedUserIds.length}
        isUnassigning={isUnassigning}
        onClose={handleCloseUnassignDialog}
        onConfirm={handleConfirmUnassignUsers}
      />

      {/* Manage Teachers Modal */}
      {subject && (
        <AssignTeachersToSubject
          open={isManageTeachersOpen}
          onClose={() => setIsManageTeachersOpen(false)}
          subject={subject}
        />
      )}
    </Box>
  );
};

export default SubjectDetail;
