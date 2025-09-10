import { useLazyGetModulsBySubjectQuery } from '@app/redux/api';
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [currentSubjectId, setCurrentSubjectId] = useState(null);
  const [selectedModulId, setSelectedModulId] = useState('');
  const [trigger, { data: moduls = [], isFetching }] = useLazyGetModulsBySubjectQuery();

  // Listen for subject changes from TeamSwitcher
  useEffect(() => {
    const updateSubject = () => {
      const id = localStorage.getItem('currentSubjectId');
      setCurrentSubjectId(id);
    };
    updateSubject();
    window.addEventListener('subjectChanged', updateSubject);
    return () => window.removeEventListener('subjectChanged', updateSubject);
  }, []);

  // Fetch modules when subject changes
  useEffect(() => {
    if (currentSubjectId) {
      trigger(currentSubjectId);
      setSelectedModulId('');
    }
  }, [currentSubjectId, trigger]);

  const handleModulChange = (event) => {
    setSelectedModulId(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      {isFetching ? (
        <CircularProgress />
      ) : moduls && moduls.length > 0 ? (
        <FormControl fullWidth sx={{ maxWidth: 400, mb: 3 }}>
          <InputLabel id="modul-select-label">Modul</InputLabel>
          <Select
            labelId="modul-select-label"
            value={selectedModulId}
            label="Modul"
            onChange={handleModulChange}
          >
            {moduls.map((modul) => (
              <MenuItem key={modul._id} value={modul._id}>
                {modul.name || modul.title || modul._id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Typography color="text.secondary">Pre tento predmet nie sú žiadne moduly.</Typography>
      )}
    </Box>
  );
};

export default Dashboard;
