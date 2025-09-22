import { useCurrentSubject } from '@app/hooks/useCurrentSubject'; // adjust path as needed
import * as authService from '@app/pages/auth/authService';
import { useGetModulsBySubjectQuery, useGetQuestionByUserIdQuery } from '@app/redux/api';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import React from 'react';

const MyQuestions = () => {
  const auth = authService.getUserFromStorage();
  const userId = auth.id;

  // Get current subject from team switcher
  const currentSubject = useCurrentSubject();
  const subjectId = currentSubject?._id || currentSubject?.id || '';

  // Filter state
  const [filter, setFilter] = React.useState({
    date: '',
    modulId: ''
  });

  // Debug: manual week override
  const [debugWeekOverride, setDebugWeekOverride] = React.useState(null);

  // Fetch modules for the selected subject
  const { data: subjectModuls = [] } = useGetModulsBySubjectQuery(subjectId, {
    skip: !subjectId
  });

  // Fetch all user's questions
  const {
    data: questions = [],
    isLoading,
    error
  } = useGetQuestionByUserIdQuery(userId, {
    skip: !userId
  });

  // Helper to determine current week for a module
  const getCurrentWeek = (modul) => {
    // Debug override takes precedence
    if (debugWeekOverride !== null) {
      return debugWeekOverride;
    }

    if (!modul || !modul.date_start || !modul.date_end) return 1;

    try {
      const now = new Date();
      const start = new Date(modul.date_start);
      const end = new Date(modul.date_end);

      if (now < start) return 0; // Not started
      if (now > end) return 4; // Finished (past week 3)

      const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      const week = Math.floor(diffDays / 7) + 1;
      return Math.min(Math.max(week, 1), 3);
    } catch {
      return 1;
    }
  };

  // Helper to get module name by id
  const getModulName = (modulId) => {
    const modul = subjectModuls.find((m) => m._id === modulId);
    return modul ? modul.title || modul.name : modulId;
  };

  // Group questions by module
  const questionsByModule = React.useMemo(() => {
    const filtered = questions.filter((q) => {
      let pass = true;
      if (subjectId) {
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

    const grouped = {};
    filtered.forEach((q) => {
      if (!grouped[q.modul]) {
        grouped[q.modul] = [];
      }
      grouped[q.modul].push(q);
    });
    return grouped;
  }, [questions, subjectModuls, subjectId, filter]);

  // Render question based on module's current week
  const renderQuestion = (question, currentWeek) => {
    const isInWeek3OrLater = currentWeek >= 3;

    return (
      <Card key={question._id} sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {question.text}
          </Typography>

          {/* Answer options */}
          <Box sx={{ mb: 2 }}>
            {question.options &&
              Object.entries(question.options).map(([key, value]) => (
                <Typography
                  key={key}
                  variant="body2"
                  sx={{
                    color: key === question.correct ? 'success.dark' : 'text.secondary',
                    fontWeight: key === question.correct ? 600 : 400,
                    ml: 1,
                    mb: 0.5
                  }}
                >
                  {key.toUpperCase()}) {value} {key === question.correct && '✓'}
                </Typography>
              ))}
          </Box>

          {/* Week 3+ content - show validation status and feedback */}
          {isInWeek3OrLater && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {/* Validation status */}
                {question.validated_by ? (
                  <Chip
                    label={question.validated ? 'Validná' : 'Nevalidná'}
                    color={question.validated ? 'success' : 'error'}
                    size="small"
                  />
                ) : (
                  <Chip
                    label="Nevalidovaná"
                    size="small"
                    sx={{
                      backgroundColor: '#000000',
                      color: 'white'
                    }}
                  />
                )}

                {/* User agreement status */}
                {question.user_agreement && (
                  <Chip
                    label={question.user_agreement.agreed ? 'Súhlasím' : 'Nesúhlasím'}
                    color={question.user_agreement.agreed ? 'success' : 'warning'}
                    size="small"
                  />
                )}
              </Box>

              {/* Validation comment */}
              {question.validation_comment && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
                >
                  Validačný komentár: {question.validation_comment}
                </Typography>
              )}

              {/* User's response */}
              {question.user_agreement && question.user_agreement.comment && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, fontStyle: 'italic', color: 'text.primary' }}
                >
                  Tvoja odpoveď: {question.user_agreement.comment}
                </Typography>
              )}
            </Box>
          )}

          {/* Creation date */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Vytvorené: {new Date(question.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  if (!subjectId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Moje otázky
        </Typography>
        <Typography>Najprv vyberte predmet v team switcheri.</Typography>
      </Box>
    );
  }

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
          onChange={(e) => setFilter((f) => ({ ...f, date: e.target.value }))}
        />
      </Box>

      {/* Debug controls */}
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
            onClick={() => setDebugWeekOverride(1)}
            color={debugWeekOverride === 1 ? 'primary' : 'inherit'}
          >
            Týždeň 1
          </Button>
          <Button
            onClick={() => setDebugWeekOverride(2)}
            color={debugWeekOverride === 2 ? 'primary' : 'inherit'}
          >
            Týždeň 2
          </Button>
          <Button
            onClick={() => setDebugWeekOverride(3)}
            color={debugWeekOverride === 3 ? 'primary' : 'inherit'}
          >
            Týždeň 3
          </Button>
          <Button
            onClick={() => setDebugWeekOverride(4)}
            color={debugWeekOverride === 4 ? 'primary' : 'inherit'}
          >
            Dokončené
          </Button>
          <Button onClick={() => setDebugWeekOverride(null)}>Reset</Button>
        </ButtonGroup>
        {debugWeekOverride && (
          <Chip
            label={`Aktívny: ${debugWeekOverride === 4 ? 'Dokončené' : `Týždeň ${debugWeekOverride}`}`}
            size="small"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      {/* Questions grouped by module */}
      {Object.entries(questionsByModule).map(([modulId, moduleQuestions], index) => {
        const modul = subjectModuls.find((m) => m._id === modulId);
        const currentWeek = getCurrentWeek(modul);
        const weekStatus =
          currentWeek === 0 ? 'Nezačalo' : currentWeek >= 4 ? 'Dokončené' : `Týždeň ${currentWeek}`;

        return (
          <Box key={modulId}>
            {index > 0 && <Divider sx={{ my: 4 }} />}

            {/* Module header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {getModulName(modulId)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {weekStatus} • {moduleQuestions.length} otázok
              </Typography>
            </Box>

            {/* Questions in a row (2 per row) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {moduleQuestions.map((question) => renderQuestion(question, currentWeek))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default MyQuestions;
