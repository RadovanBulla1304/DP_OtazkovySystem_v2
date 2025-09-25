import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId';
import {
  useGetForumQuestionsQuery,
  useGetForumTagsQuery,
  useGetModulsBySubjectQuery
} from '@app/redux/api';
import { Add, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
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
    tags: [], // Changed to array for visual selector
    sortBy: 'likes' // Default to likes sorting as requested
  });

  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError
  } = useGetForumQuestionsQuery({
    page,
    limit: 10,
    ...filters,
    // Convert tags array to comma-separated string for backend
    tags: filters.tags.length > 0 ? filters.tags.join(',') : ''
  });

  const currentSubjectId = useCurrentSubjectId();
  const { data: modulesData = [] } = useGetModulsBySubjectQuery(currentSubjectId, {
    skip: !currentSubjectId
  });

  const { data: tagsData = [] } = useGetForumTagsQuery(currentSubjectId, {
    skip: !currentSubjectId
  });

  const availableTags = Array.isArray(tagsData?.data)
    ? tagsData.data
    : Array.isArray(tagsData)
      ? tagsData
      : [];

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(1); // Reset to first page when filtering
  };

  const handleTagToggle = (tag) => {
    setFilters((prev) => {
      const isSelected = prev.tags.includes(tag);
      return {
        ...prev,
        tags: isSelected ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag]
      };
    });
    setPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleClearFilters = () => {
    setFilters({
      modul: '',
      search: '',
      tags: [], // Reset to empty array
      sortBy: 'likes' // Reset to default sorting
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

          {/* Tags filter - Chips */}
          <Box sx={{ minWidth: 300 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Filtrovať podľa tagov
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                maxHeight: 140,
                overflowY: 'auto',
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              {availableTags.length > 0 ? (
                availableTags.map((tagItem) => (
                  <Chip
                    key={tagItem.tag}
                    label={`${tagItem.tag} (${tagItem.count})`}
                    variant={filters.tags.includes(tagItem.tag) ? 'filled' : 'outlined'}
                    color={filters.tags.includes(tagItem.tag) ? 'primary' : 'default'}
                    clickable
                    onClick={() => handleTagToggle(tagItem.tag)}
                    size="small"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Žiadne dostupné tagy
                </Typography>
              )}
            </Box>
            {filters.tags.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Vybrané: {filters.tags.join(', ')}
              </Typography>
            )}
          </Box>

          {/* Sort filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Zoradiť podľa</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={handleFilterChange('sortBy')}
              label="Zoradiť podľa"
            >
              <MenuItem value="likes">Najobľúbenejšie (Like)</MenuItem>
              <MenuItem value="dislikes">Najnegatívnejšie (Dislike)</MenuItem>
              <MenuItem value="popular">Najpopulárnejšie</MenuItem>
              <MenuItem value="comments">Najviac komentárov</MenuItem>
              <MenuItem value="newest">Najnovšie</MenuItem>
              <MenuItem value="oldest">Najstaršie</MenuItem>
            </Select>
          </FormControl>

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
