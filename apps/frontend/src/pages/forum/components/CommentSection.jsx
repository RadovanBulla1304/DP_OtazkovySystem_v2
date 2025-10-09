import { useAddCommentMutation, useGetForumQuestionQuery } from '@app/redux/api';
import { Send } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Comment from './Comment';

const CommentSection = ({ questionId }) => {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const { data: questionData, isLoading, error } = useGetForumQuestionQuery(questionId);

  const [addComment, { isLoading: addingComment, error: addCommentError }] =
    useAddCommentMutation();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment({
        questionId,
        content: newComment.trim()
      }).unwrap();

      setNewComment('');
      setIsAddingComment(false);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAddComment();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Chyba pri načítavaní komentárov: {error?.data?.message || 'Neznáma chyba'}
      </Alert>
    );
  }

  const comments = questionData?.data?.comments || [];

  return (
    <Box>
      {/* Add comment section */}
      <Box sx={{ mb: 3 }}>
        {!isAddingComment ? (
          <Button
            variant="outlined"
            onClick={() => setIsAddingComment(true)}
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            Pridať komentár...
          </Button>
        ) : (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napíšte váš komentár..."
              variant="outlined"
              autoFocus
            />

            {addCommentError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {addCommentError?.data?.message || 'Chyba pri pridávaní komentára'}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setIsAddingComment(false);
                  setNewComment('');
                }}
                disabled={addingComment}
                color="error"
              >
                Zrušiť
              </Button>
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!newComment.trim() || addingComment}
                startIcon={addingComment ? <CircularProgress size={16} /> : <Send />}
              >
                {addingComment ? 'Pridávam...' : 'Pridať'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Comments list */}
      {comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Zatiaľ žiadne komentáre. Buďte prvý, kto pridá komentár!
        </Typography>
      ) : (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Komentáre ({comments.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {comments.map((comment, index) => (
            <Box key={comment._id}>
              <Comment comment={comment} questionId={questionId} level={0} />
              {index < comments.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

CommentSection.propTypes = {
  questionId: PropTypes.string.isRequired
};

export default CommentSection;
