import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import PropTypes from 'prop-types';

const QuestionsFilters = ({ currentSubject, filter, setFilter, subjectModuls }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <TextField
        label="Predmet"
        value={currentSubject?.name || ''}
        size="small"
        InputProps={{ readOnly: true }}
        sx={{ minWidth: 160 }}
      />
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="modul-filter-label">Modul</InputLabel>
        <Select
          labelId="modul-filter-label"
          label="Modul"
          value={filter.modulId}
          onChange={(e) => setFilter((f) => ({ ...f, modulId: e.target.value }))}
        >
          <MenuItem value="">Všetky</MenuItem>
          {subjectModuls.map((m) => (
            <MenuItem key={m._id} value={m._id}>
              {m.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Dátum"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={filter.date}
        onChange={(e) => setFilter((f) => ({ ...f, date: e.target.value }))}
      />
    </Box>
  );
};

QuestionsFilters.propTypes = {
  currentSubject: PropTypes.shape({
    name: PropTypes.string
  }),
  filter: PropTypes.shape({
    modulId: PropTypes.string,
    date: PropTypes.string
  }).isRequired,
  setFilter: PropTypes.func.isRequired,
  subjectModuls: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired
    })
  ).isRequired
};

export default QuestionsFilters;
