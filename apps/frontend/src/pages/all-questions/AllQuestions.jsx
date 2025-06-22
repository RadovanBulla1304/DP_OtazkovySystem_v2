import { useCurrentSubject } from '@app/hooks/useCurrentSubject';
import {
  useGetModulsBySubjectQuery,
  useGetQuestionsByModulQuery,
  useGetQuestionsBySubjectIdQuery
} from '@app/redux/api';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import RatingsListModal from '../admin/components/RatingsListModal';
import QuestionCard from './QuestionCard';
import QuestionsFilters from './QuestionsFilters';

const AllQuestions = () => {
  const currentSubject = useCurrentSubject();
  const subjectId = currentSubject?._id || currentSubject?.id || '';

  const [filter, setFilter] = React.useState({ date: '', modulId: '' });

  const { data: subjectModuls = [] } = useGetModulsBySubjectQuery(subjectId, { skip: !subjectId });

  const {
    data: subjectQuestions = [],
    isLoading: loadingQuestions,
    error: errorQuestions
  } = useGetQuestionsBySubjectIdQuery(subjectId, { skip: !subjectId });

  const { data: modulQuestions = [], isLoading: loadingModulQuestions } =
    useGetQuestionsByModulQuery(filter.modulId, {
      skip: !filter.modulId
    });

  let questions = [];
  if (filter.modulId) {
    questions = modulQuestions;
  } else if (subjectId) {
    questions = subjectQuestions;
  }

  const filteredQuestions = filter.date
    ? questions.filter((q) => q.createdAt.slice(0, 10) === filter.date)
    : questions;

  const [openListModal, setOpenListModal] = React.useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = React.useState(null);

  const handleOpenListModal = (questionId) => {
    setSelectedQuestionId(questionId);
    setOpenListModal(true);
  };
  const handleCloseListModal = () => {
    setOpenListModal(false);
    setSelectedQuestionId(null);
  };

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

      <QuestionsFilters
        currentSubject={currentSubject}
        filter={filter}
        setFilter={setFilter}
        subjectModuls={subjectModuls}
      />

      <Grid container spacing={3}>
        {filteredQuestions.map((q) => (
          <Grid item xs={12} md={6} lg={4} key={q._id}>
            <QuestionCard
              question={q}
              subjectModuls={subjectModuls}
              onOpenList={handleOpenListModal}
            />
          </Grid>
        ))}
      </Grid>

      <RatingsListModal
        open={openListModal}
        onClose={handleCloseListModal}
        questionId={selectedQuestionId}
      />
    </Box>
  );
};

export default AllQuestions;
