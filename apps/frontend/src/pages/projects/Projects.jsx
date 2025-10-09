import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import {
  useDeleteProjectMutation,
  useGetAllProjectsQuery,
  useGetTeacherMeQuery,
  useGetUserProjectsQuery
} from '@app/redux/api';
import {
  Add,
  Stars as AssignPointsIcon,
  Group as AssignUsersIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AddProjectModal from './components/AddProjectModal';
import AssignPointsToProject from './components/AssignPointsToProject';
import AssignUsersToProject from './components/AssignUsersToProject';
import PeerEvaluationModal from './components/PeerEvaluationModal';

const Projects = () => {
  // Check if user is a teacher
  const { data: teacher } = useGetTeacherMeQuery();
  const isTeacher = !!teacher;
  const currentSubjectId = useCurrentSubjectId();

  // Teachers see all projects filtered by subject, users see only their assigned projects
  const {
    data: allProjectsData,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    refetch: refetchAll
  } = useGetAllProjectsQuery(currentSubjectId ? { subject: currentSubjectId } : undefined, {
    skip: !isTeacher
  });

  const {
    data: userProjectsData,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    refetch: refetchUser
  } = useGetUserProjectsQuery(undefined, {
    skip: isTeacher
  });

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignUsersProjectId, setAssignUsersProjectId] = useState(null);
  const [assignPointsProject, setAssignPointsProject] = useState(null);
  const [isPeerEvaluationOpen, setIsPeerEvaluationOpen] = useState(false);

  const projects = isTeacher ? allProjectsData?.data || [] : userProjectsData?.data || [];
  const isLoading = isTeacher ? isLoadingAll : isLoadingUser;
  const isError = isTeacher ? isErrorAll : isErrorUser;
  const refetch = isTeacher ? refetchAll : refetchUser;

  const [deleteProject] = useDeleteProjectMutation();

  const handleOpenProjectModal = () => setIsProjectModalOpen(true);
  const handleCloseProjectModal = () => setIsProjectModalOpen(false);

  const handleProjectCreated = async () => {
    try {
      await refetch();
      handleCloseProjectModal();
    } catch (error) {
      console.error('Chyba pri vytváraní projektu:', error);
      toast.error('Chyba pri vytváraní projektu');
    }
  };

  const confirmDelete = async (project) => {
    try {
      setIsDeleting(true);
      console.log('Deleting project:', project._id);

      const response = await deleteProject(project._id);

      if (response.error) {
        toast.error('Error deleting project: ' + response.error?.data?.message);
      } else {
        toast.success('Project deleted successfully');
        await refetch();
      }
    } catch (error) {
      console.error('Error during deletion process:', error);
      toast.error('Error deleting project');
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktívny';
      case 'completed':
        return 'Ukončený';
      case 'cancelled':
        return 'Zrušený';
      default:
        return 'default';
    }
  };

  const handleOpenAssignUsers = (e, projectId) => {
    e.stopPropagation();
    setAssignUsersProjectId(projectId);
  };

  const handleCloseAssignUsers = () => {
    setAssignUsersProjectId(null);
  };

  const handleOpenAssignPoints = (e, project) => {
    e.stopPropagation();
    setAssignPointsProject(project);
  };

  const handleCloseAssignPoints = () => {
    setAssignPointsProject(null);
  };

  const handleOpenPeerEvaluation = () => {
    setIsPeerEvaluationOpen(true);
  };

  const handleClosePeerEvaluation = () => {
    setIsPeerEvaluationOpen(false);
  };

  // Refetch projects when component mounts or when user/subject changes
  useEffect(() => {
    if (isTeacher) {
      refetchAll();
    } else {
      refetchUser();
    }
  }, [isTeacher, currentSubjectId, refetchAll, refetchUser]);

  if (isLoading || isDeleting) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">Error loading projects</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 3, pb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Projekty</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" color="secondary" onClick={handleOpenPeerEvaluation}>
            Vzájomné hodnotenie
          </Button>
          {isTeacher && (
            <Button
              startIcon={<Add />}
              size="medium"
              variant="contained"
              color="primary"
              onClick={handleOpenProjectModal}
            >
              Nový Projekt
            </Button>
          )}
        </Box>
      </Box>

      {isTeacher && (
        <AddProjectModal
          open={isProjectModalOpen}
          onClose={handleCloseProjectModal}
          onSuccess={handleProjectCreated}
        />
      )}

      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary" align="center">
                  Žiadne vytvorené projekty
                </Typography>
                <Typography color="textSecondary" align="center" sx={{ mt: 1 }}>
                  Kliknite na &quot;Nový Projekt&quot; a začnite.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={project._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography gutterBottom variant="h5" component="div">
                      {project.name}
                    </Typography>
                    <Chip
                      label={getStatusText(project.status)}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>

                  {project.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {project.description.length > 100
                        ? `${project.description.substring(0, 100)}...`
                        : project.description}
                    </Typography>
                  )}

                  {project.subject && (
                    <Box mb={1}>
                      <Chip label={project.subject.name} size="small" variant="outlined" />
                    </Box>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    Študenti: {project.assigned_users?.length || 0} / {project.max_members}
                  </Typography>

                  {project.assigned_users && project.assigned_users.length > 0 && (
                    <Box sx={{ mt: 1, mb: 1 }}>
                      {project.assigned_users.map((user, index) => (
                        <Typography
                          key={user._id || index}
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ ml: 1 }}
                        >
                          •{' '}
                          {user.name && user.surname
                            ? `${user.name} ${user.surname}`
                            : user.name || user.username || user.email}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    Vytvorené: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>

                  {project.due_date && (
                    <Typography variant="body2" color="text.secondary">
                      Deadline odovzdania: {new Date(project.due_date).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
                {isTeacher && (
                  <Box p={2} pt={0}>
                    <Box display="flex" justifyContent="flex-end" alignItems="center">
                      <Box>
                        <Tooltip title="Priradiť používateľov">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenAssignUsers(e, project._id)}
                            disabled={isDeleting}
                          >
                            <AssignUsersIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Priradiť body">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => handleOpenAssignPoints(e, project)}
                            disabled={isDeleting}
                          >
                            <AssignPointsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Odstrániť projekt">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Delete button clicked for project:', project.name);
                              setProjectToDelete(project);
                            }}
                            disabled={isDeleting}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Confirmation Dialog for Delete Project */}
      {isTeacher && projectToDelete && (
        <Dialog
          open={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          aria-labelledby="delete-project-dialog-title"
          aria-describedby="delete-project-dialog-description"
        >
          <DialogTitle id="delete-project-dialog-title">Odstrániť projekt?</DialogTitle>
          <DialogContent>
            <Typography id="delete-project-dialog-description">
              Ste si istý, že chcete odstrániť projekt <strong>{projectToDelete.name}</strong>? Táto
              akcia sa nedá vrátiť späť.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setProjectToDelete(null)}
              disabled={isDeleting}
              variant="outlined"
              color="error"
            >
              Zrušiť
            </Button>
            <Button
              onClick={() => {
                console.log('Delete confirmed for project:', projectToDelete._id);
                confirmDelete(projectToDelete);
              }}
              color="error"
              variant="contained"
              disabled={isDeleting}
            >
              {isDeleting ? 'Maže sa...' : 'Vymazať'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Assign Users Modal */}
      {isTeacher && assignUsersProjectId && (
        <AssignUsersToProject
          open={!!assignUsersProjectId}
          onClose={handleCloseAssignUsers}
          projectId={assignUsersProjectId}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Assign Points Modal */}
      {isTeacher && assignPointsProject && (
        <AssignPointsToProject
          open={!!assignPointsProject}
          onClose={handleCloseAssignPoints}
          project={assignPointsProject}
          onSuccess={() => {
            toast.success('Points assigned successfully');
          }}
        />
      )}

      {/* Peer Evaluation Modal */}
      <PeerEvaluationModal open={isPeerEvaluationOpen} onClose={handleClosePeerEvaluation} />
    </Box>
  );
};

export default Projects;
