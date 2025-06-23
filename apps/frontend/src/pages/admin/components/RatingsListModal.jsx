import { useGetRatingsByQuestionIdQuery, useGetUserByIdQuery } from '@app/redux/api';
import { Box, Button, CircularProgress, Modal, Typography } from '@mui/material';
import Rating from '@mui/material/Rating';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { useMemo } from 'react';

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

const RatingsTable = ({ questionId }) => {
  const { data: ratings = [], isLoading } = useGetRatingsByQuestionIdQuery(questionId);

  const rows = useMemo(() => {
    return ratings.map((r) => ({
      id: r._id,
      rating: r.rating,
      comment: r.comment || '(bez komentára)',
      ratedBy: r.ratedBy,
      createdAt: new Date(r.createdAt).toLocaleString()
    }));
  }, [ratings]);

  const columns = [
    {
      field: 'rating',
      headerName: 'Hodnotenie',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center', // ensure vertical centering
            justifyContent: 'flex-start',
            gap: 1,
            height: '100%' // take full height of the cell
          }}
        >
          <Rating value={params.value} readOnly size="small" precision={0.5} />
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1 }}>
            {params.value}/5
          </Typography>
        </Box>
      ),
      sortable: true
    },
    {
      field: 'comment',
      headerName: 'Komentár',
      flex: 2,
      minWidth: 200
    },
    {
      field: 'ratedBy',
      headerName: 'Používateľ',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => <UserInfo userId={params.value} />
    },
    {
      field: 'createdAt',
      headerName: 'Dátum',
      flex: 2,
      minWidth: 180
    }
  ];

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <CircularProgress size={24} />
      </Box>
    );

  if (!ratings.length) return <Typography>Žiadne hodnotenia.</Typography>;

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      autoHeight
      pageSizeOptions={[10, 20, 50]}
      initialState={{
        density: 'compact',
        pagination: {
          paginationModel: {
            pageSize: 10
          }
        }
      }}
      slots={{ toolbar: GridToolbar }}
      slotProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 300 }
        }
      }}
      disableRowSelectionOnClick
    />
  );
};

RatingsTable.propTypes = {
  questionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

const RatingsListModal = ({ open, onClose, questionId }) => (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
        position: 'fixed',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: 2,
        width: '90%',
        maxWidth: 1000,
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 24
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Hodnotenia otázky
      </Typography>
      {questionId && <RatingsTable questionId={questionId} />}
      <Box sx={{ mt: 2, textAlign: 'right' }}>
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
