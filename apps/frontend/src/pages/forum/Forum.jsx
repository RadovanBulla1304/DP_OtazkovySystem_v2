import { useGetForumQuestionsQuery, useGetModulsBySubjectQuery } from '@app/redux/api';
import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import { Add, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import AddQuestionDialog from './AddQuestionDialog';
import QuestionCard from './QuestionCard';

const Forum = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    modul: '',
    search: '',
    tags: ''
  });

  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError
  } = useGetForumQuestionsQuery({
    page,
    limit: 10,
    ...filters
  });

  const currentSubjectId = useCurrentSubjectId();
  const { data: modulesData = [] } = useGetModulsBySubjectQuery(currentSubjectId, {
    skip: !currentSubjectId
  });

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleClearFilters = () => {
    setFilters({
      modul: '',
      search: '',
      tags: ''
    });
    setPage(1);
  };

  const questions = questionsData?.data || [];
  const pagination = questionsData?.pagination || {};

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Fórum
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
          size="large"
        >
          Pridať otázku
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtrovanie
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'end' }}>
          {/* Search */}
          <TextField
            label="Vyhľadávanie"
            value={filters.search}
            onChange={handleFilterChange('search')}
            placeholder="Hľadať v nadpisoch a opisoch..."
            sx={{ minWidth: 300, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />

          {/* Module filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Modul</InputLabel>
            <Select value={filters.modul} onChange={handleFilterChange('modul')} label="Modul">
              <MenuItem value="">Všetky moduly</MenuItem>
              {modulesData?.map((module) => (
                <MenuItem key={module._id} value={module._id}>
                  {module.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Tags filter */}
          <TextField
            label="Tagy"
            value={filters.tags}
            onChange={handleFilterChange('tags')}
            placeholder="javascript,react,..."
            sx={{ minWidth: 200 }}
            helperText="Oddeľte čiarkou"
          />

          {/* Clear filters */}
          <Button onClick={handleClearFilters} variant="outlined" sx={{ height: 'fit-content' }}>
            Vymazať filtre
          </Button>
        </Box>
      </Paper>

      {/* Questions list */}
      <Box>
        {questionsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Chyba pri načítavaní otázok: {questionsError?.data?.message || 'Neznáma chyba'}
          </Alert>
        )}

        {questionsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : questions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Žiadne otázky
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {Object.values(filters).some((f) => f)
                ? 'Pre zadané filtre neboli nájdené žiadne otázky.'
                : 'Zatiaľ nie sú v tomto fóre žiadne otázky.'}
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setAddDialogOpen(true)}>
              Pridať prvú otázku
            </Button>
          </Paper>
        ) : (
          <>
            {/* Results info */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Zobrazuje sa {questions.length} z {pagination.totalQuestions} otázok
            </Typography>

            {/* Questions */}
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Add Question Dialog */}
      <AddQuestionDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} />
    </Container>
  );
};

export default Forum;
