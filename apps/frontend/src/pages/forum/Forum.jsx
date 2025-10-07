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
    sortBy: 'likes', // Default to likes sorting as requested
    createdByModel: '' // Filter by author type: '', 'User', or 'Teacher'
  });

  // Build query params - keep empty string for sortBy, remove undefined/empty for others
  const rawParams = {
    page,
    limit: 10,
    modul: filters.modul || undefined,
    search: filters.search || undefined,
    tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
    sortBy: filters.sortBy,
    createdByModel: filters.createdByModel || undefined
  };

  // Remove undefined values but keep empty strings for sortBy
  const queryParams = Object.fromEntries(
    Object.entries(rawParams).filter(([key, value]) => {
      if (key === 'sortBy') return true; // Always include sortBy
      return value !== undefined && value !== '';
    })
  );

  console.log('Forum query params:', queryParams);

  const {
    data: questionsData,
    isLoading: questionsLoading,
    error: questionsError
  } = useGetForumQuestionsQuery(queryParams);

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
      sortBy: 'likes', // Reset to default sorting
      createdByModel: '' // Reset author type filter
    });
    setPage(1);
  };

  const questions = questionsData?.data || [];
  const pagination = questionsData?.pagination || {};

  return (
    <Box sx={{ pt: 2 }}>
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

          {/* Author type filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Autor</InputLabel>
            <Select
              value={filters.createdByModel}
              onChange={handleFilterChange('createdByModel')}
              label="Autor"
            >
              <MenuItem value="">Všetci</MenuItem>
              <MenuItem value="User">Anonymní používatelia</MenuItem>
              <MenuItem value="Teacher">Učitelia</MenuItem>
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
    </Box>
  );
};

export default Forum;
