import { Box, Button, ButtonGroup, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const DebugWeekControls = ({ debugWeekOverride, onWeekChange }) => {
  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        bgcolor: 'warning.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'warning.200'
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Debug: Manuálne prepnutie týždňa
      </Typography>
      <ButtonGroup variant="outlined" size="small">
        <Button
          onClick={() => onWeekChange(1)}
          color={debugWeekOverride === 1 ? 'primary' : 'inherit'}
        >
          Týždeň 1
        </Button>
        <Button
          onClick={() => onWeekChange(2)}
          color={debugWeekOverride === 2 ? 'primary' : 'inherit'}
        >
          Týždeň 2
        </Button>
        <Button
          onClick={() => onWeekChange(3)}
          color={debugWeekOverride === 3 ? 'primary' : 'inherit'}
        >
          Týždeň 3
        </Button>
        <Button
          onClick={() => onWeekChange(4)}
          color={debugWeekOverride === 4 ? 'primary' : 'inherit'}
        >
          Dokončené
        </Button>
        <Button onClick={() => onWeekChange(null)}>Reset</Button>
      </ButtonGroup>
      {debugWeekOverride && (
        <Chip
          label={`Aktívny: ${debugWeekOverride === 4 ? 'Dokončené' : `Týždeň ${debugWeekOverride}`}`}
          size="small"
          sx={{ ml: 1 }}
        />
      )}
    </Box>
  );
};

DebugWeekControls.propTypes = {
  debugWeekOverride: PropTypes.number,
  onWeekChange: PropTypes.func.isRequired
};

export default DebugWeekControls;
