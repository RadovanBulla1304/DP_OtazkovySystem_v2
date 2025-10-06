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
  List,
  ListItem,
  ListItemText,
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
      <DialogTitle>{editingTest ? 'Upraviť test' : 'Vytvoriť nový test'}</DialogTitle>
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
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </Grid>

          <Grid item xs={6}>
            <DateTimePicker
              label="Dátum a čas konca"
              value={formData.date_end}
              onChange={(value) => onInputChange('date_end', value)}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </Grid>

          <Grid item xs={6}>
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

          <Grid item xs={6}>
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
            {/* Show count of available questions */}
            {formData.selected_modules.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {validatedQuestionsLoading
                    ? 'Načítavam otázky...'
                    : `Dostupných validovaných otázok: ${availableQuestionsCount}`}
                </Typography>
                {availableQuestionsCount < formData.total_questions &&
                  availableQuestionsCount > 0 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Nie je dosť validovaných otázok pre tento test. Požadované:{' '}
                      {formData.total_questions}, Dostupné: {availableQuestionsCount}
                    </Alert>
                  )}
                {availableQuestionsCount === 0 && !validatedQuestionsLoading && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    Žiadne validované otázky v vybraných moduloch!
                  </Alert>
                )}
              </Box>
            )}

            {/* Show list of validated questions from selected modules */}
            {formData.selected_modules.length > 0 && validatedQuestions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Validované otázky z vybraných modulov ({validatedQuestions.length}):
                </Typography>
                <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  <List dense>
                    {validatedQuestions.slice(0, 10).map((q) => (
                      <ListItem key={q._id}>
                        <ListItemText
                          primary={q.text || q.question_text}
                          secondary={`Modul: ${q.modul?.name || q.modul?.title || 'N/A'}`}
                        />
                      </ListItem>
                    ))}
                    {validatedQuestions.length > 10 && (
                      <ListItem>
                        <ListItemText
                          secondary={`... a ${validatedQuestions.length - 10} ďalších otázok`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Pri spustení testu bude každému študentovi náhodne vybraných{' '}
                  {formData.total_questions} otázok z týchto validovaných otázok.
                </Typography>
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
        <Button onClick={onClose} variant="outlined">
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
