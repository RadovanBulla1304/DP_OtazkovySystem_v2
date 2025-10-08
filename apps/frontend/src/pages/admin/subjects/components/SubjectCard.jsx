import { Delete as DeleteIcon } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const SubjectCard = ({ subject, onCardClick, onDeleteClick, isDeleting }) => {
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
      </CardContent>
      <Box p={2} pt={0}>
        <Box display="flex" justifyContent="end" alignItems="center">
          <Box>
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
      </Box>
    </Card>
  );
};

SubjectCard.propTypes = {
  subject: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  }).isRequired,
  onCardClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool
};

export default SubjectCard;
