import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import * as authService from '@app/pages/auth/authService';
import {
  useGetAllSubjectsAssignedToUserQuery,
  useGetAllSubjectsQuery,
  useGetTeacherMeQuery,
  useGetTeacherSubjectsQuery,
  useGetUserMeQuery
} from '@app/redux/api';
import { styled } from '@mui/material/styles';
import AddSubjectModal from '../../pages/admin/subjects/components/AddSubjectModal';

const TeamSwitcherButton = styled(Button)(({ theme }) => ({
  width: '100%',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
  border: `1px solid ${theme.palette.divider}`,
  marginTop: 'auto',
  marginBottom: theme.spacing(2),
  whiteSpace: 'nowrap',
  overflow: 'hidden'
}));

const SubjectAvatar = styled(Avatar)(({ theme }) => ({
  width: 24,
  height: 24,
  fontSize: '0.75rem',
  backgroundColor: theme.palette.primary.main,
  marginRight: theme.spacing(1)
}));

// For collapsed mode
const CollapsedAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  fontSize: '0.875rem',
  backgroundColor: theme.palette.primary.main,
  cursor: 'pointer'
}));

const TeamSwitcher = ({ collapsed = false }) => {
  const user = authService.getUserFromStorage();

  // Determine if user is a teacher from localStorage first
  const isTeacherFromStorage = user?.isTeacher === true;

  // Fetch user and teacher data based on localStorage info
  const { data: userData, isLoading: isUserLoading } = useGetUserMeQuery(undefined, {
    skip: isTeacherFromStorage
  });

  const { data: teacherData, isLoading: isTeacherLoading } = useGetTeacherMeQuery(undefined, {
    skip: !isTeacherFromStorage
  });

  // Determine roles based on which data we have
  // For USERS: both admin and non-admin see their assigned subjects (no difference)
  // For TEACHERS: admin sees all subjects, non-admin sees only their assigned subjects
  const isAdminTeacher = isTeacherFromStorage && teacherData?.isAdmin;
  const isRegularTeacher = isTeacherFromStorage && !!teacherData && !teacherData.isAdmin;
  const isAnyUser = !isTeacherFromStorage && !!userData;

  // Conditionally fetch subjects based on role
  const {
    data: allSubjects = [],
    isLoading: isLoadingAll,
    refetch: refetchAll
  } = useGetAllSubjectsQuery(undefined, {
    skip: !isAdminTeacher,
    refetchOnMountOrArgChange: true
  });

  const {
    data: teacherSubjects = [],
    isLoading: isLoadingTeacher,
    refetch: refetchTeacher
  } = useGetTeacherSubjectsQuery(undefined, {
    skip: !isRegularTeacher,
    refetchOnMountOrArgChange: true
  });

  const {
    data: allSubjectsAssignedToUser = [],
    isLoading: isLoadingAssigned,
    refetch: refetchAssigned
  } = useGetAllSubjectsAssignedToUserQuery(user?._id, {
    skip: !isAnyUser || !user?._id,
    refetchOnMountOrArgChange: true
  });

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const open = Boolean(anchorEl);

  // Use appropriate subjects array based on role
  const subjects = React.useMemo(() => {
    if (isAdminTeacher) return allSubjects;
    if (isRegularTeacher) return teacherSubjects;
    if (isAnyUser) return allSubjectsAssignedToUser;
    return [];
  }, [
    isAdminTeacher,
    isRegularTeacher,
    isAnyUser,
    allSubjects,
    teacherSubjects,
    allSubjectsAssignedToUser
  ]);

  const isLoading = isAdminTeacher
    ? isLoadingAll
    : isRegularTeacher
      ? isLoadingTeacher
      : isLoadingAssigned;
  const refetch = isAdminTeacher ? refetchAll : isRegularTeacher ? refetchTeacher : refetchAssigned;

  // Wait for role determination before showing subjects
  const isRoleDetermined = !isUserLoading && !isTeacherLoading;

  // Get the current subject ID from localStorage using useSyncExternalStore
  const currentSubjectId = React.useSyncExternalStore(
    (cb) => {
      window.addEventListener('subjectChanged', cb);
      return () => window.removeEventListener('subjectChanged', cb);
    },
    () => localStorage.getItem('currentSubjectId'),
    () => localStorage.getItem('currentSubjectId')
  );

  // Compute current subject from subjects array and current ID
  const currentSubject = React.useMemo(() => {
    if (!currentSubjectId || subjects.length === 0) {
      return subjects[0] || null;
    }
    const found = subjects.find((s) => s.id === currentSubjectId);
    return found || subjects[0] || null;
  }, [currentSubjectId, subjects]);

  // Initialize subject ID in localStorage if not set
  React.useEffect(() => {
    const storedId = localStorage.getItem('currentSubjectId');
    if (!storedId && subjects.length > 0) {
      localStorage.setItem('currentSubjectId', subjects[0].id);
      window.dispatchEvent(new Event('subjectChanged'));
    }
  }, [subjects]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSubjectSelect = (subject) => {
    localStorage.setItem('currentSubjectId', subject.id);
    window.dispatchEvent(new Event('subjectChanged'));
    handleClose();
  };

  const handleAddSubject = () => {
    handleClose();
    setModalOpen(true);
  };

  const handleSubjectCreated = (newSubject) => {
    localStorage.setItem('currentSubjectId', newSubject.id);
    window.dispatchEvent(new Event('subjectChanged'));
    refetch();
    setModalOpen(false);
  };

  if (collapsed) {
    return (
      <>
        <CollapsedAvatar onClick={handleClick}>
          {currentSubject?.name?.charAt(0) || '?'}
        </CollapsedAvatar>

        <Popover
          id="subject-menu"
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left'
          }}
        >
          <Box sx={{ width: 230, maxHeight: 350, overflow: 'auto' }}>
            <List dense>
              {!isRoleDetermined || isLoading ? (
                <ListItem>
                  <ListItemText primary="Načítavam..." />
                </ListItem>
              ) : (
                subjects.map((subject) => (
                  <ListItem
                    key={subject.id}
                    button
                    onClick={() => handleSubjectSelect(subject)}
                    selected={currentSubject?.id === subject.id}
                    sx={{ '&:hover': { cursor: 'pointer' } }}
                  >
                    <SubjectAvatar>{subject.name.charAt(0)}</SubjectAvatar>
                    <ListItemText primary={subject.name} />
                  </ListItem>
                ))
              )}

              {(isAdminTeacher || isRegularTeacher) && subjects.length > 0 && (
                <Divider sx={{ my: 1 }} />
              )}
              {(isAdminTeacher || isRegularTeacher) && (
                <ListItemButton
                  onClick={handleAddSubject}
                  sx={{ '&:hover': { cursor: 'pointer' } }}
                >
                  <AddIcon fontSize="small" sx={{ mr: 1 }} />
                  <ListItemText primary="Pridať predmet" />
                </ListItemButton>
              )}
            </List>
          </Box>
        </Popover>

        <AddSubjectModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSubjectCreated}
        />
      </>
    );
  }

  // Regular expanded view
  return (
    <>
      <TeamSwitcherButton
        onClick={handleClick}
        aria-controls={open ? 'subject-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <SubjectAvatar>{currentSubject?.name?.charAt(0) || '?'}</SubjectAvatar>
          <Typography
            variant="body2"
            sx={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {!isRoleDetermined || isLoading
              ? 'Načítavam...'
              : currentSubject?.name || 'Žiadny predmet'}
          </Typography>
          <ExpandMoreIcon fontSize="small" sx={{ flexShrink: 0 }} />
        </Box>
      </TeamSwitcherButton>

      <Popover
        id="subject-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <Box sx={{ width: 230, maxHeight: 350, overflow: 'auto' }}>
          <List dense>
            {!isRoleDetermined || isLoading ? (
              <ListItem>
                <ListItemText primary="Načítavam..." />
              </ListItem>
            ) : (
              subjects.map((subject) => (
                <ListItemButton
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject)}
                  selected={currentSubject?.id === subject.id}
                  sx={{ '&:hover': { cursor: 'pointer' } }}
                >
                  <SubjectAvatar>{subject.name.charAt(0)}</SubjectAvatar>
                  <ListItemText primary={subject.name} />
                </ListItemButton>
              ))
            )}

            {(isAdminTeacher || isRegularTeacher) && subjects.length > 0 && (
              <Divider sx={{ my: 1 }} />
            )}
            {(isAdminTeacher || isRegularTeacher) && (
              <ListItemButton onClick={handleAddSubject} sx={{ '&:hover': { cursor: 'pointer' } }}>
                <AddIcon fontSize="small" sx={{ mr: 1 }} />
                <ListItemText primary="Pridať predmet" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Popover>

      <AddSubjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSubjectCreated}
      />
    </>
  );
};

TeamSwitcher.propTypes = {
  collapsed: PropTypes.bool
};

export default TeamSwitcher;
