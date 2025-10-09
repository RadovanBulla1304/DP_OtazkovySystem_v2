import {
  useAddCommentMutation,
  useDislikeCommentMutation,
  useLikeCommentMutation
} from '@app/redux/api';
import { ExpandLess, ExpandMore, Reply, Send, ThumbDown, ThumbUp } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import PropTypes from 'prop-types';
import { useState } from 'react';

const Comment = ({ comment, questionId, level = 0 }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [addComment, { isLoading: addingReply, error: replyError }] = useAddCommentMutation();
  const [likeComment, { isLoading: isLikingComment }] = useLikeCommentMutation();
  const [dislikeComment, { isLoading: isDislikingComment }] = useDislikeCommentMutation();

  const maxNestingLevel = 4; // Limit nesting to prevent too deep threads
  const canReply = level < maxNestingLevel;

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: sk
    });
  };

  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      await addComment({
        questionId,
        content: replyText.trim(),
        parentComment: comment._id
      }).unwrap();

      setReplyText('');
      setIsReplying(false);
      setShowReplies(true); // Show replies after adding one
    } catch (err) {
      console.error('Error adding reply:', err);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleReply();
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();

    if (isLikingComment || isDislikingComment || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await likeComment(comment._id).unwrap();
    } catch (error) {
      console.error(`Error liking comment ${comment._id}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDislike = async (e) => {
    e.stopPropagation();

    if (isLikingComment || isDislikingComment || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await dislikeComment(comment._id).unwrap();
    } catch (error) {
      console.error(`Error disliking comment ${comment._id}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const replies = comment.replies || [];

  return (
    <Box sx={{ ml: level * 3 }}>
      {/* Comment content */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {/* Avatar */}
        <Avatar
          sx={{ width: level === 0 ? 40 : 32, height: level === 0 ? 40 : 32 }}
          src={comment.createdBy?.avatar}
        >
          {comment.createdBy?.username?.charAt(0).toUpperCase()}
        </Avatar>

        {/* Comment body */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Author and date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {comment.createdBy?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(comment.createdAt)}
            </Typography>
          </Box>

          {/* Comment text */}
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {comment.content}
          </Typography>

          {/* Interaction buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Like/Dislike */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={handleLike}
                disabled={isLikingComment || isDislikingComment || isProcessing}
                sx={{
                  color: comment.user_liked ? 'success.main' : 'text.secondary',
                  '&:hover': {
                    color: comment.user_liked ? 'success.dark' : 'success.main'
                  },
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                <ThumbUp fontSize="small" />
              </IconButton>
              <Typography variant="caption">{comment.likes_count || 0}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={handleDislike}
                disabled={isLikingComment || isDislikingComment || isProcessing}
                sx={{
                  color: comment.user_disliked ? 'error.main' : 'text.secondary',
                  '&:hover': {
                    color: comment.user_disliked ? 'error.dark' : 'error.main'
                  },
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                <ThumbDown fontSize="small" />
              </IconButton>
              <Typography variant="caption">{comment.dislikes_count || 0}</Typography>
            </Box>

            {/* Reply button */}
            {canReply && (
              <Button
                size="small"
                startIcon={<Reply fontSize="small" />}
                onClick={() => setIsReplying(!isReplying)}
                sx={{ ml: 1 }}
              >
                Odpovedať
              </Button>
            )}

            {/* Show/hide replies */}
            {replies.length > 0 && (
              <Button
                size="small"
                startIcon={showReplies ? <ExpandLess /> : <ExpandMore />}
                onClick={handleToggleReplies}
                sx={{ ml: 1 }}
              >
                {replies.length} {replies.length === 1 ? 'odpoveď' : 'odpovedí'}
              </Button>
            )}
          </Box>

          {/* Reply input */}
          <Collapse in={isReplying}>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Napíšte odpoveď..."
                variant="outlined"
                size="small"
                autoFocus
              />

              {replyError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {replyError?.data?.message || 'Chyba pri pridávaní odpovede'}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText('');
                  }}
                  disabled={addingReply}
                  variant="outlined"
                  color="error"
                >
                  Zrušiť
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleReply}
                  disabled={!replyText.trim() || addingReply}
                  startIcon={addingReply ? <CircularProgress size={14} /> : <Send />}
                >
                  {addingReply ? 'Pridávam...' : 'Odpovedať'}
                </Button>
              </Box>
            </Box>
          </Collapse>

          {/* Nested replies */}
          <Collapse in={showReplies}>
            {replies.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {replies.map((reply, index) => (
                  <Box key={reply._id} sx={{ mb: index < replies.length - 1 ? 2 : 0 }}>
                    <Comment comment={reply} questionId={questionId} level={level + 1} />
                  </Box>
                ))}
              </Box>
            )}
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};

Comment.propTypes = {
  comment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    likes_count: PropTypes.number,
    dislikes_count: PropTypes.number,
    user_liked: PropTypes.bool,
    user_disliked: PropTypes.bool,
    replies_count: PropTypes.number,
    createdBy: PropTypes.shape({
      username: PropTypes.string,
      avatar: PropTypes.string
    }),
    replies: PropTypes.array
  }).isRequired,
  questionId: PropTypes.string.isRequired,
  level: PropTypes.number
};

export default Comment;
