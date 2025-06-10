import { useCurrentSubject } from '@app/hooks/useCurrentSubject'; // adjust path as needed
import {
  useGetModulsBySubjectQuery,
  useGetQuestionsByModulQuery,
  useGetQuestionsBySubjectIdQuery
} from '@app/redux/api';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import React from 'react';

const answerLetterToLabel = { a: 'A', b: 'B', c: 'C', d: 'D' };

const AllQuestions = () => {
  // Get current subject from team switcher
  const currentSubject = useCurrentSubject();
  const subjectId = currentSubject?._id || currentSubject?.id || '';

  // Filters
  const [filter, setFilter] = React.useState({
    date: '',
    modulId: ''
  });

  // Fetch modules for the selected subject
  const { data: subjectModuls = [] } = useGetModulsBySubjectQuery(subjectId, {
    skip: !subjectId
  });

  // Fetch questions for the selected subject
  const {
    data: subjectQuestions = [],
    isLoading: loadingQuestions,
    error: errorQuestions
  } = useGetQuestionsBySubjectIdQuery(subjectId, {
    skip: !subjectId
  });

  // Fetch questions for the selected module (if module is selected)
  const { data: modulQuestions = [], isLoading: loadingModulQuestions } =
    useGetQuestionsByModulQuery(filter.modulId, {
      skip: !filter.modulId
    });

  // Filtering logic
  let questions = [];
  if (filter.modulId) {
    questions = modulQuestions;
  } else if (subjectId) {
    questions = subjectQuestions;
  }

  // Filter by date if set
  const filteredQuestions = filter.date
    ? questions.filter((q) => q.createdAt.slice(0, 10) === filter.date)
    : questions;

  if (!subjectId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Všetky otázky
        </Typography>
        <Typography>Najprv vyberte predmet v team switcheri.</Typography>
      </Box>
    );
  }

  if (loadingQuestions || loadingModulQuestions) return <Typography>Načítavam...</Typography>;
  if (errorQuestions) return <Typography color="error">Chyba pri načítaní otázok.</Typography>;
  if (!questions.length) return <Typography>Žiadne otázky pre tento predmet/modul.</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Všetky otázky
      </Typography>

      {/* Filters */}
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

      <Grid container spacing={3}>
        {filteredQuestions.map((q) => (
          <Grid item xs={12} md={6} lg={4} key={q._id}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {q.text}
                  </Typography>
                }
                subheader={
                  <Typography variant="caption" color="text.secondary">
                    Modul: {subjectModuls.find((m) => m._id === q.modul)?.title || q.modul}
                  </Typography>
                }
              />
              <CardContent>
                {Object.entries(q.options).map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      bgcolor: 'background.paper',
                      borderRadius: 2
                    }}
                  >
                    <Chip
                      label={answerLetterToLabel[key]}
                      color="default"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 400,
                        color: 'text.primary'
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
                <Typography variant="caption" color="text.secondary">
                  Vytvorené: {new Date(q.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AllQuestions;
