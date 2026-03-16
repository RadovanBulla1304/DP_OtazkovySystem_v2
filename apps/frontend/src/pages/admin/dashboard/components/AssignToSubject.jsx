import { useAsignUserToSubjectMutation, useGetAllSubjectsQuery } from '@app/redux/api';
import {
  Box,
  Button,
  CircularProgress,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'calc(100% - 24px)',
  maxWidth: 400,
  backgroundColor: (theme) =>
    theme.palette.mode === 'dark' ? theme.palette.background.default : 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  borderRadius: 2
};

const AssignToSubject = ({ open, onClose, userIds, onSuccess }) => {
  const { data: subjects = [], isLoading: isSubjectsLoading } = useGetAllSubjectsQuery();
  const [asignUserToSubject, { isLoading }] = useAsignUserToSubjectMutation();
  const [selectedSubject, setSelectedSubject] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      toast.error('Vyberte predmet');
      return;
    }
    try {
      await asignUserToSubject({
        subjectId: selectedSubject,
        userId: userIds.length === 1 ? userIds[0] : userIds
      }).unwrap();
      toast.success('Používateľ(ia) boli priradení k predmetu');
      setSelectedSubject('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error('Chyba pri priraďovaní používateľov k predmetu', err);
    }
  };

  const handleCancel = () => {
    setSelectedSubject('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel} aria-labelledby="modal-assign-subject-title">
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <DialogTitle id="modal-assign-subject-title" sx={{ fontWeight: 600, p: 0 }} mb={3}>
          Priradiť používateľov k predmetu
        </DialogTitle>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel id="select-subject-label">Predmet</InputLabel>
            <Select
              labelId="select-subject-label"
              label="Predmet"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={isSubjectsLoading || isLoading}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject._id} value={subject._id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isLoading}
              color="error"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Zrušiť
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !selectedSubject}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Priradiť'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

AssignToSubject.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSuccess: PropTypes.func
};

export default AssignToSubject;
