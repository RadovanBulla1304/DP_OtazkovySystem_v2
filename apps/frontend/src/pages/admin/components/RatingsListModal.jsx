import { useGetRatingsByQuestionIdQuery, useGetUserByIdQuery } from '@app/redux/api';
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  Modal,
  Rating,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';

const UserInfo = ({ userId }) => {
  const { data: user, isLoading } = useGetUserByIdQuery(userId);

  if (isLoading)
    return (
      <Typography variant="caption" color="text.secondary">
        Načítavam používateľa...
      </Typography>
    );
  if (!user)
    return (
      <Typography variant="caption" color="text.secondary">
        Používateľ nenájdený
      </Typography>
    );

  return (
    <Typography variant="caption" color="text.secondary">
      {user.name} ({user.email})
    </Typography>
  );
};

UserInfo.propTypes = {
  userId: PropTypes.string.isRequired
};

const RatingsList = ({ questionId }) => {
  const { data: ratings = [], isLoading } = useGetRatingsByQuestionIdQuery(questionId);

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <CircularProgress size={24} />
      </Box>
    );
  if (!ratings.length) return <Typography>Žiadne hodnotenia.</Typography>;

  return (
    <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
      {ratings.map((r) => (
        <ListItem
          key={r._id}
          sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2, px: 0 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={r.rating} readOnly size="small" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {r.rating}/5
            </Typography>
          </Box>
          {r.comment && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {r.comment}
            </Typography>
          )}
          <UserInfo userId={r.ratedBy} />
        </ListItem>
      ))}
    </List>
  );
};

RatingsList.propTypes = {
  questionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

const RatingsListModal = ({ open, onClose, questionId }) => (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: 2,
        minWidth: 500,
        maxWidth: 700,
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: 24
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Hodnotenia otázky
      </Typography>
      {questionId && <RatingsList questionId={questionId} />}
      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button onClick={onClose} variant="outlined">
          Zavrieť
        </Button>
      </Box>
    </Box>
  </Modal>
);

RatingsListModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  questionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default RatingsListModal;
