import * as authService from '@app/pages/auth/authService';
import { useGetTeacherMeQuery } from '@app/redux/api';
import { Delete as DeleteIcon, People as PeopleIcon } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const SubjectCard = ({
  subject,
  onCardClick,
  onDeleteClick,
  onManageTeachersClick,
  isDeleting
}) => {
  // Get current teacher to check if they created this subject
  const storedUser = authService.getUserFromStorage();
  const isTeacherFromStorage = storedUser?.isTeacher === true;
  const { data: currentTeacher } = useGetTeacherMeQuery(undefined, {
    skip: !isTeacherFromStorage
  });

  // Check if current teacher is the creator or an admin
  const canManageTeachers = currentTeacher?.isAdmin || currentTeacher?._id === subject.createdBy;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3
        }
      }}
      onClick={() => onCardClick(subject._id)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {subject.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vytvorené: {new Date(subject.createdAt).toLocaleDateString()}
        </Typography>

        {/* Creator Teacher */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Vytvorené učiteľom:
          </Typography>
          {subject.createdBy && subject.assigned_teachers ? (
            (() => {
              const creatorData =
                typeof subject.createdBy === 'string'
                  ? subject.assigned_teachers.find((t) =>
                      typeof t === 'string' ? t === subject.createdBy : t._id === subject.createdBy
                    )
                  : subject.createdBy;
              const creator = typeof creatorData === 'string' ? null : creatorData;
              return creator ? (
                <Chip
                  key={creator._id}
                  label={`${creator.name} ${creator.surname}`}
                  size="small"
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
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Priradení učitelia:
          </Typography>
          {subject.assigned_teachers && subject.assigned_teachers.length > 0 ? (
            (() => {
              // Filter out the creator from assigned teachers
              const otherTeachers = subject.assigned_teachers.filter((teacher) => {
                const teacherId = typeof teacher === 'string' ? teacher : teacher._id;
                return teacherId !== subject.createdBy;
              });

              if (otherTeachers.length === 0) {
                return (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Žiadni ďalší učitelia
                  </Typography>
                );
              }

              return (
                <>
                  {otherTeachers.slice(0, 3).map((teacher) => {
                    const teacherData = typeof teacher === 'string' ? null : teacher;
                    return teacherData ? (
                      <Chip
                        key={teacherData._id}
                        label={`${teacherData.name} ${teacherData.surname}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : null;
                  })}
                  {otherTeachers.length > 3 && (
                    <Chip
                      label={`+${otherTeachers.length - 3} ďalších`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </>
              );
            })()
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Žiadni učitelia
            </Typography>
          )}
        </Box>
      </CardContent>
      <Box p={2} pt={0}>
        <Box display="flex" justifyContent="end" alignItems="center" gap={1}>
          {canManageTeachers && (
            <Tooltip title="Spravovať učiteľov">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onManageTeachersClick(subject);
                }}
              >
                <PeopleIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Odstrániť predmet">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(subject);
              }}
              disabled={isDeleting}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};

SubjectCard.propTypes = {
  subject: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    createdBy: PropTypes.string.isRequired,
    assigned_teachers: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          surname: PropTypes.string.isRequired
        })
      ])
    )
  }).isRequired,
  onCardClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onManageTeachersClick: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool
};

export default SubjectCard;
