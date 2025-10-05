# Tests.jsx Changes Required

## Summary

Remove the "Generate Questions" functionality and replace it with showing validated questions from selected modules.

## Changes Needed:

### 1. Remove from formData state:

```jsx
// REMOVE THIS LINE:
generated_questions: [];
```

### 2. Remove these state variables (lines ~88-90):

```jsx
// REMOVE THESE:
const [showGeneratedQuestions, setShowGeneratedQuestions] = useState(false);
const [generatingQuestions, setGeneratingQuestions] = useState(false);
```

### 3. Replace the validated questions hook (line ~114-117):

```jsx
// REPLACE THIS:
const { data: validatedQuestions = [], isLoading: validatedQuestionsLoading } =
  useGetValidatedQuestionsWithAgreementBySubjectQuery(subjectId, {
    skip: !subjectId,
  });

// WITH THIS:
const moduleIdsString = formData.selected_modules.join(",");
const { data: validatedQuestionsData, isLoading: validatedQuestionsLoading } =
  useGetValidatedQuestionsByModulesQuery(moduleIdsString, {
    skip: !formData.selected_modules.length,
  });
const validatedQuestions = validatedQuestionsData?.data || [];

const { data: questionsCountData } = useGetValidatedQuestionsCountQuery(
  moduleIdsString,
  {
    skip: !formData.selected_modules.length,
  }
);
const availableQuestionsCount = questionsCountData?.count || 0;
```

### 4. Remove handleGenerateQuestions function (lines ~137-318):

```jsx
// DELETE THE ENTIRE FUNCTION:
const handleGenerateQuestions = () => {
  ...
};
```

### 5. Update resetForm callback (lines ~121-133):

```jsx
const resetForm = useCallback(() => {
  setFormData({
    title: "",
    description: "",
    total_questions: 10,
    date_start: new Date(),
    date_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time_limit: 30,
    selected_modules: [],
    max_attempts: 1,
    passing_score: 60,
    // REMOVE: generated_questions: []
  });
  setEditingTest(null);
  // REMOVE: setShowGeneratedQuestions(false);
}, []);
```

### 6. In the Dialog Content (around lines 770-830):

Replace the "Generate Questions" button and toggle section with:

```jsx
{
  /* Show count of available questions */
}
{
  formData.selected_modules.length > 0 && (
    <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {validatedQuestionsLoading
          ? "Načítavam otázky..."
          : `Dostupných validovaných otázok: ${availableQuestionsCount}`}
      </Typography>
      {availableQuestionsCount < formData.total_questions && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Nie je dosť validovaných otázok pre tento test. Požadované:{" "}
          {formData.total_questions}, Dostupné: {availableQuestionsCount}
        </Alert>
      )}
    </Box>
  );
}

{
  /* Show list of validated questions from selected modules */
}
{
  formData.selected_modules.length > 0 && validatedQuestions.length > 0 && (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Validované otázky z vybraných modulov:
      </Typography>
      <Paper sx={{ maxHeight: 300, overflow: "auto", p: 2 }}>
        <List dense>
          {validatedQuestions.map((q) => (
            <ListItem key={q._id}>
              <ListItemText
                primary={q.question_text}
                secondary={`Modul: ${q.modul?.name || "N/A"} | Validovaná: ${
                  q.validated ? "Áno" : "Nie"
                }`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        Pri spustení testu bude každému študentovi náhodne vybraných{" "}
        {formData.total_questions} otázok z týchto validovaných otázok.
      </Typography>
    </Box>
  );
}

{
  /* Button to create new question (optional) */
}
<Button
  variant="outlined"
  startIcon={<AddIcon />}
  onClick={() => setIsCreateQuestionModalOpen(true)}
  sx={{ mt: 2 }}
>
  Vytvoriť novú otázku
</Button>;
```

### 7. In handleSubmit (around line 355-436):

Remove references to `generated_questions`:

```jsx
// REMOVE this from the test data being submitted:
// generated_questions: formData.generated_questions

// The backend doesn't need generated_questions anymore
// It will select random questions when user starts the test
```

## Key Concept Changes:

**Before:**

- Teacher generates specific questions
- All students get the same questions
- Questions stored in test

**After:**

- Teacher selects modules
- System shows available validated questions
- Each student gets random questions when they start the test
- Questions NOT stored in test, only module selection

## Testing:

1. Create a test with selected modules
2. Verify count shows correctly
3. Verify validated questions list displays
4. Submit test (should work without generated_questions)
5. When student starts test, backend will randomly select questions

Would you like me to help implement these changes section by section?
