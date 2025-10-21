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
          ID: {subject._id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vytvorené: {new Date(subject.createdAt).toLocaleDateString()}
        </Typography>

        {/* Assigned Teachers */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Učitelia:
          </Typography>
          {subject.assigned_teachers && subject.assigned_teachers.length > 0 ? (
            subject.assigned_teachers.slice(0, 3).map((teacher) => {
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
            })
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Žiadni učitelia
            </Typography>
          )}
          {subject.assigned_teachers && subject.assigned_teachers.length > 3 && (
            <Chip
              label={`+${subject.assigned_teachers.length - 3} ďalších`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
      <Box p={2} pt={0}>
        <Box display="flex" justifyContent="end" alignItems="center" gap={1}>
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
