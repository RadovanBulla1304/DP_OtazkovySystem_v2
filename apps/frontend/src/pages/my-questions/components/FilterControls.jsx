import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import PropTypes from 'prop-types';

const FilterControls = ({ currentSubject, filter, onFilterChange, subjectModuls }) => {
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
          onChange={(e) => onFilterChange({ ...filter, modulId: e.target.value })}
        >
          <MenuItem value="">Všetky</MenuItem>
          {subjectModuls.map((m) => (
            <MenuItem key={m._id} value={m._id}>
              {m.title || m.name}
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
        onChange={(e) => onFilterChange({ ...filter, date: e.target.value })}
      />
    </Box>
  );
};

FilterControls.propTypes = {
  currentSubject: PropTypes.shape({
    name: PropTypes.string
  }),
  filter: PropTypes.shape({
    modulId: PropTypes.string,
    date: PropTypes.string
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  subjectModuls: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string,
      name: PropTypes.string
    })
  ).isRequired
};

export default FilterControls;
