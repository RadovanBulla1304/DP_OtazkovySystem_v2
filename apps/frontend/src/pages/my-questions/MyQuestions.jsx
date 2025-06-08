import * as authService from '@app/pages/auth/authService';
import {
  useGetAllSubjectsQuery,
  useGetModulsBySubjectQuery,
  useGetQuestionByUserIdQuery
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

const MyQuestions = () => {
  const auth = authService.getUserFromStorage();
  const userId = auth.id;

  // Fetch all subjects for the subject dropdown
  const { data: allSubjects = [] } = useGetAllSubjectsQuery();

  // Filter state
  const [filter, setFilter] = React.useState({
    date: '',
    modulId: '',
    subjectId: ''
  });

  // Fetch modules for the selected subject
  const { data: subjectModuls = [] } = useGetModulsBySubjectQuery(filter.subjectId, {
    skip: !filter.subjectId
  });

  const {
    data: questions = [],
    isLoading,
    error
  } = useGetQuestionByUserIdQuery(userId, {
    skip: !userId
  });

  // Filtering logic
  const filteredQuestions = questions.filter((q) => {
    let pass = true;
    if (filter.subjectId) {
      // Only show questions from modules of the selected subject
      pass = pass && subjectModuls.some((m) => m._id === q.modul);
    }
    if (filter.modulId) {
      pass = pass && q.modul === filter.modulId;
    }
    if (filter.date) {
      pass = pass && q.createdAt.slice(0, 10) === filter.date;
    }
    return pass;
  });

  if (isLoading) return <Typography>Načítavam...</Typography>;
  if (error) return <Typography color="error">Chyba pri načítaní otázok.</Typography>;
  if (!questions.length) return <Typography>Nemáte žiadne otázky.</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Moje otázky
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="subject-filter-label">Predmet</InputLabel>
          <Select
            labelId="subject-filter-label"
            label="Predmet"
            value={filter.subjectId}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                subjectId: e.target.value,
                modulId: '' // reset module when subject changes
              }))
            }
          >
            <MenuItem value="">Vyber predmet</MenuItem>
            {allSubjects.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Show module select only if subject is chosen */}
        {filter.subjectId && (
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
        )}
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
                    Modul ID: {q.modul}
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
                      pl: 1,
                      bgcolor: q.correct === key ? 'primary.light' : 'background.paper',
                      borderRadius: 2
                    }}
                  >
                    <Chip
                      label={answerLetterToLabel[key]}
                      color={q.correct === key ? 'primary' : 'default'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: q.correct === key ? 700 : 400,
                        color: q.correct === key ? 'primary.main' : 'text.primary'
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

export default MyQuestions;
