import {
  useGetValidatedQuestionsByModulesQuery,
  useGetValidatedQuestionsCountQuery
} from '@app/redux/api';
import { Add as AddIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import PropTypes from 'prop-types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const TestFormDialog = ({
  open,
  onClose,
  editingTest,
  formData,
  onInputChange,
  onSubmit,
  creating,
  updating,
  modules,
  onOpenCreateQuestion
}) => {
  // Fetch validated questions based on selected modules
  const moduleIdsString = formData.selected_modules.join(',');
  const { data: validatedQuestionsData, isLoading: validatedQuestionsLoading } =
    useGetValidatedQuestionsByModulesQuery(moduleIdsString, {
      skip: !formData.selected_modules.length
    });
  const validatedQuestions = validatedQuestionsData?.data || [];

  const { data: questionsCountData } = useGetValidatedQuestionsCountQuery(moduleIdsString, {
    skip: !formData.selected_modules.length
  });
  const availableQuestionsCount = questionsCountData?.count || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0, fontWeight: 600 }}>
        {editingTest ? 'Upraviť test' : 'Vytvoriť nový test'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Názov Testu"
              fullWidth
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Popis"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Celkový počet otázok"
              type="number"
              fullWidth
              value={formData.total_questions}
              onChange={(e) => onInputChange('total_questions', parseInt(e.target.value))}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Časový limit (minúty)"
              type="number"
              fullWidth
              value={formData.time_limit}
              onChange={(e) => onInputChange('time_limit', parseInt(e.target.value))}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DateTimePicker
              label="Dátum a čas začiatku"
              value={formData.date_start}
              onChange={(value) => onInputChange('date_start', value)}
              format="dd/MM/yyyy HH:mm"
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          </Grid>

          <Grid item xs={6}>
            <DateTimePicker
              label="Dátum a čas konca"
              value={formData.date_end}
              onChange={(value) => onInputChange('date_end', value)}
              format="dd/MM/yyyy HH:mm"
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              label="Maximálny počet pokusov"
              type="number"
              fullWidth
              value={formData.max_attempts}
              onChange={(e) => onInputChange('max_attempts', parseInt(e.target.value))}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              label="Hranica úspešnosti (%)"
              type="number"
              fullWidth
              value={formData.passing_score}
              onChange={(e) => onInputChange('passing_score', parseInt(e.target.value))}
              inputProps={{ min: 0, max: 100 }}
              required
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              label="Maximálny počet bodov"
              type="number"
              fullWidth
              value={formData.max_points}
              onChange={(e) => onInputChange('max_points', parseInt(e.target.value))}
              inputProps={{ min: 1 }}
              required
              helperText="Celkový počet bodov, ktoré môže študent získať"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Vyberte moduly</InputLabel>
              <Select
                multiple
                value={formData.selected_modules}
                onChange={(e) => onInputChange('selected_modules', e.target.value)}
                input={<OutlinedInput label="Vyberte moduly" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const module = modules.find((m) => m._id === value || m.id === value);
                      return (
                        <Chip
                          key={value}
                          label={
                            module
                              ? module.name || module.title || 'Modul bez názvu'
                              : 'Neznámy modul'
                          }
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {modules.map((module) => (
                  <MenuItem key={module._id} value={module._id}>
                    {module.name || module.title || 'Modul bez názvu'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            {/* Show statistics of available questions */}
            {formData.selected_modules.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Paper sx={{ p: 2, pt: 0, bgcolor: 'background.paper' }}>
                  {validatedQuestionsLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      Načítavam otázky...
                    </Typography>
                  ) : (
                    <>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {availableQuestionsCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Celkový počet dostupných otázok
                        </Typography>
                      </Box>

                      {availableQuestionsCount < formData.total_questions &&
                        availableQuestionsCount > 0 && (
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            Nie je dosť validovaných otázok pre tento test. Požadované:{' '}
                            {formData.total_questions}, Dostupné: {availableQuestionsCount}
                          </Alert>
                        )}

                      {availableQuestionsCount === 0 && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          Žiadne validované otázky v vybraných moduloch!
                        </Alert>
                      )}

                      {validatedQuestions.length > 0 && (
                        <>
                          {/* Questions by module */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                              Rozdelenie podľa modulov:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {(() => {
                                const byModule = {};
                                validatedQuestions.forEach((q) => {
                                  const moduleName =
                                    q.modul?.name || q.modul?.title || 'Neznámy modul';
                                  byModule[moduleName] = (byModule[moduleName] || 0) + 1;
                                });
                                return Object.entries(byModule).map(([moduleName, count]) => (
                                  <Chip
                                    key={moduleName}
                                    label={`${moduleName}: ${count}`}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                  />
                                ));
                              })()}
                            </Box>
                          </Box>

                          {/* Questions by year */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                              Rozdelenie podľa roku vytvorenia:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {(() => {
                                const byYear = {};
                                validatedQuestions.forEach((q) => {
                                  if (q.createdAt) {
                                    const year = new Date(q.createdAt).getFullYear();
                                    byYear[year] = (byYear[year] || 0) + 1;
                                  }
                                });
                                return Object.entries(byYear)
                                  .sort(([a], [b]) => b - a)
                                  .map(([year, count]) => (
                                    <Chip
                                      key={year}
                                      label={`${year}: ${count}`}
                                      color="secondary"
                                      variant="outlined"
                                      size="small"
                                    />
                                  ));
                              })()}
                            </Box>
                          </Box>
                        </>
                      )}
                    </>
                  )}
                </Paper>

                {availableQuestionsCount > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Pri spustení testu bude každému študentovi náhodne vybraných{' '}
                    {formData.total_questions} otázok z týchto validovaných otázok.
                  </Typography>
                )}
              </Box>
            )}

            {/* Button to create new question (optional) */}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onOpenCreateQuestion}
              sx={{ mt: 2 }}
            >
              Vytvoriť novú otázku
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">
          Zrušiť
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={creating || updating || !formData.title || !formData.selected_modules.length}
        >
          {creating || updating ? 'Ukladám...' : editingTest ? 'Upraviť' : 'Vytvoriť'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TestFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editingTest: PropTypes.object,
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  creating: PropTypes.bool.isRequired,
  updating: PropTypes.bool.isRequired,
  modules: PropTypes.array.isRequired,
  onOpenCreateQuestion: PropTypes.func.isRequired
};

export default TestFormDialog;
