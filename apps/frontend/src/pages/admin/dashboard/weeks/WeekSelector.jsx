import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import DefaultWeek from './DefaultWeek';
import Week1 from './Week1';
import Week2 from './Week2';
import Week3 from './Week3';

const WeekSelector = ({
  selectedModul,
  weeks,
  selectedWeekNumber,
  setSelectedWeekNumber,
  formatDate,
  questionsByWeekMerged,
  modulQuestions,
  userId,
  setLocalCreated,
  setQuestionToValidate,
  setValidateOpen,
  setQuestionToRespond,
  setRespondOpen,
  currentWeekNumber
}) => {
  const renderWeek = (w) => {
    // For the right side selector, we don't show "active" status
    // Just show if it's accessible or not
    const isAccessible = w.weekNumber <= currentWeekNumber;
    const status = isAccessible ? 'Dostupný' : 'Nedostupný';

    const commonProps = {
      week: w,
      isCurrent: false, // Never show as current in the selector
      status,
      formatDate
    };

    // Week 1: Add questions
    if (w.weekNumber === 1) {
      return (
        <Week1
          {...commonProps}
          questionsByWeekMerged={questionsByWeekMerged}
          selectedModul={selectedModul}
          setLocalCreated={setLocalCreated}
          userId={userId}
        />
      );
    }

    // Week 2: Validate external questions
    if (w.weekNumber === 2) {
      return (
        <Week2
          {...commonProps}
          modulQuestions={modulQuestions}
          userId={userId}
          setQuestionToValidate={setQuestionToValidate}
          setValidateOpen={setValidateOpen}
        />
      );
    }

    // Week 3: Respond to validations
    if (w.weekNumber === 3) {
      return (
        <Week3
          {...commonProps}
          modulQuestions={modulQuestions}
          userId={userId}
          setQuestionToRespond={setQuestionToRespond}
          setRespondOpen={setRespondOpen}
        />
      );
    }

    // Default for other weeks
    return <DefaultWeek {...commonProps} />;
  };

  return (
    <Box sx={{ width: '50%', pl: 2 }}>
      {/* Module info and date range at top */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {selectedModul && (
          <Box>
            <Typography sx={{ fontWeight: 600 }}>
              {selectedModul.name || selectedModul.title || ''}
            </Typography>
            <Typography color="text.secondary">
              {selectedModul.date_start ? formatDate(selectedModul.date_start) : '-'} —{' '}
              {selectedModul.date_end ? formatDate(selectedModul.date_end) : '-'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Week selector dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="week-select-label">Týždeň</InputLabel>
        <Select
          labelId="week-select-label"
          value={selectedWeekNumber}
          label="Týždeň"
          onChange={(e) => setSelectedWeekNumber(Number(e.target.value))}
        >
          {weeks.map((w) => (
            <MenuItem key={w.weekNumber} value={w.weekNumber}>
              Týždeň {w.weekNumber} ({formatDate(w.start)})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Selected week content */}
      {(() => {
        const chosen = weeks.find((x) => x.weekNumber === selectedWeekNumber) || weeks[0] || null;
        const isWeekAccessible = chosen && chosen.weekNumber <= currentWeekNumber;

        if (!chosen) {
          return <Typography>Vyberte týždeň</Typography>;
        }

        if (!isWeekAccessible) {
          return (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                border: '1px dashed',
                borderColor: 'grey.300',
                borderRadius: 1,
                bgcolor: 'grey.50'
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Týždeň {chosen.weekNumber}
              </Typography>
              <Typography color="text.secondary">Tento týždeň ešte nie je dostupný</Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                Bude dostupný počas týždňa {chosen.weekNumber}
              </Typography>
            </Box>
          );
        }

        return renderWeek(chosen);
      })()}
    </Box>
  );
};

WeekSelector.propTypes = {
  selectedModul: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    title: PropTypes.string,
    date_start: PropTypes.string,
    date_end: PropTypes.string
  }),
  weeks: PropTypes.array.isRequired,
  selectedWeekNumber: PropTypes.number.isRequired,
  setSelectedWeekNumber: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  questionsByWeekMerged: PropTypes.object.isRequired,
  modulQuestions: PropTypes.array,
  userId: PropTypes.string.isRequired,
  setLocalCreated: PropTypes.func.isRequired,
  setQuestionToValidate: PropTypes.func.isRequired,
  setValidateOpen: PropTypes.func.isRequired,
  setQuestionToRespond: PropTypes.func.isRequired,
  setRespondOpen: PropTypes.func.isRequired,
  currentWeekNumber: PropTypes.number.isRequired
};

export default WeekSelector;
