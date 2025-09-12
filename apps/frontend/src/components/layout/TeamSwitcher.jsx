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
import { useGetAllSubjectsQuery } from '@app/redux/api'; // adjust path
import { styled } from '@mui/material/styles';
import AddSubjectModal from '../../pages/admin/components/AddSubjectModal';

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
  marginBottom: theme.spacing(2)
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
  const { data: allSubjects = [], isLoading, refetch } = useGetAllSubjectsQuery();
  const user = authService.getUserFromStorage();
  const [currentSubject, setCurrentSubject] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const open = Boolean(anchorEl);

  // Filter subjects based on user assignment
  const subjects = React.useMemo(() => {
    if (user?.isAdmin) return allSubjects;
    return allSubjects.filter((subj) => subj.assigned_students?.includes(user._id));
  }, [allSubjects, user]);

  React.useEffect(() => {
    const id = localStorage.getItem('currentSubjectId');
    if (id && subjects.length > 0) {
      const found = subjects.find((s) => s.id === id);
      if (found) {
        setCurrentSubject(found);
        return;
      }
    }
    // If not found, default to first subject
    if (subjects.length > 0) {
      setCurrentSubject(subjects[0]);
      localStorage.setItem('currentSubjectId', subjects[0].id);
    }
  }, [subjects]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSubjectSelect = (subject) => {
    setCurrentSubject(subject);
    localStorage.setItem('currentSubjectId', subject.id);
    window.dispatchEvent(new Event('subjectChanged')); // <-- add this line
    handleClose();
  };

  const handleAddSubject = () => {
    handleClose();
    setModalOpen(true);
  };

  const handleSubjectCreated = (newSubject) => {
    setCurrentSubject(newSubject);
    localStorage.setItem('currentSubjectId', newSubject.id);
    window.dispatchEvent(new Event('subjectChanged')); // <-- add this line
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
              {isLoading ? (
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

              {user.isAdmin && subjects.length > 0 && <Divider sx={{ my: 1 }} />}
              {user.isAdmin && (
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
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {currentSubject?.name || 'Žiadny predmet'}
          </Typography>
          <ExpandMoreIcon fontSize="small" />
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
            {isLoading ? (
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

            {user.isAdmin && subjects.length > 0 && <Divider sx={{ my: 1 }} />}
            {user.isAdmin && (
              <ListItem button onClick={handleAddSubject} sx={{ '&:hover': { cursor: 'pointer' } }}>
                <AddIcon fontSize="small" sx={{ mr: 1 }} />
                <ListItemText primary="Pridať predmet" />
              </ListItem>
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
