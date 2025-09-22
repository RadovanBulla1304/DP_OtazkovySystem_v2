import {
  Comment as CommentIcon,
  ExpandLess,
  ExpandMore,
  PushPin,
  ThumbDown,
  ThumbUp
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Typography
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDislikeForumQuestionMutation, useLikeForumQuestionMutation } from '../../redux/api';
import CommentSection from './CommentSection';

const QuestionCard = ({ question, onQuestionClick }) => {
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [likeQuestion, { isLoading: isLiking }] = useLikeForumQuestionMutation();
  const [dislikeQuestion, { isLoading: isDisliking }] = useDislikeForumQuestionMutation();

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: sk
    });
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleLike = async (e) => {
    e.stopPropagation();

    // Prevent multiple clicks and already processing
    if (isLiking || isDisliking || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await likeQuestion(question._id).unwrap();
    } catch (error) {
      console.error(`[FE LIKE] Error liking question ${question._id}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDislike = async (e) => {
    e.stopPropagation();

    // Prevent multiple clicks and already processing
    if (isLiking || isDisliking || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await dislikeQuestion(question._id).unwrap();
    } catch (error) {
      console.error(`[FE DISLIKE] Error disliking question ${question._id}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const shouldTruncate = question.description.length > 200;

  return (
    <Card
      sx={{
        mb: 2,
        cursor: onQuestionClick ? 'pointer' : 'default',
        border: question.is_pinned ? 2 : 1,
        borderColor: question.is_pinned ? 'primary.main' : 'divider',
        '&:hover': onQuestionClick
          ? {
              boxShadow: 2
            }
          : {}
      }}
      onClick={onQuestionClick ? () => onQuestionClick(question) : undefined}
    >
      <CardContent>
        {/* Header with title and pin icon */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {question.is_pinned && <PushPin color="primary" sx={{ mr: 1, fontSize: 20 }} />}
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: question.is_pinned ? 600 : 500,
                  color: question.is_closed ? 'text.disabled' : 'inherit'
                }}
              >
                {question.header}
              </Typography>
              {question.is_closed && (
                <Chip label="Uzavretá" size="small" color="default" sx={{ ml: 1 }} />
              )}
            </Box>
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isExpanded || !shouldTruncate
            ? question.description
            : truncateText(question.description)}
        </Typography>

        {shouldTruncate && (
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpanded();
            }}
            endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
            sx={{ mb: 2, p: 0, minWidth: 'auto' }}
          >
            {isExpanded ? 'Zobraziť menej' : 'Zobraziť viac'}
          </Button>
        )}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {question.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" color="primary" />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Footer with author, date, and interaction buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Author and date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }} src={question.createdBy?.avatar}>
              {question.createdBy?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {question.createdBy?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(question.createdAt)}
              </Typography>
            </Box>
          </Box>

          {/* Interaction buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={handleLike}
                disabled={isLiking || isDisliking || isProcessing}
                sx={{
                  color: question.user_liked ? 'success.main' : 'text.secondary',
                  '&:hover': {
                    color: question.user_liked ? 'success.dark' : 'success.main'
                  },
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                <ThumbUp fontSize="small" />
              </IconButton>
              <Typography variant="caption">{question.likes_count || 0}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={handleDislike}
                disabled={isLiking || isDisliking || isProcessing}
                sx={{
                  color: question.user_disliked ? 'error.main' : 'text.secondary',
                  '&:hover': {
                    color: question.user_disliked ? 'error.dark' : 'error.main'
                  },
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                <ThumbDown fontSize="small" />
              </IconButton>
              <Typography variant="caption">{question.dislikes_count || 0}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleComments();
                }}
              >
                <CommentIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption">{question.comments_count || 0}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Comments section */}
        <Collapse in={showComments}>
          <Divider sx={{ my: 2 }} />
          <CommentSection questionId={question._id} />
        </Collapse>
      </CardContent>
    </Card>
  );
};

QuestionCard.propTypes = {
  question: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    is_pinned: PropTypes.bool,
    is_closed: PropTypes.bool,
    likes_count: PropTypes.number,
    dislikes_count: PropTypes.number,
    user_liked: PropTypes.bool,
    user_disliked: PropTypes.bool,
    comments_count: PropTypes.number,
    createdAt: PropTypes.string.isRequired,
    createdBy: PropTypes.shape({
      username: PropTypes.string,
      avatar: PropTypes.string
    }),
    modul: PropTypes.shape({
      name: PropTypes.string
    })
  }).isRequired,
  onQuestionClick: PropTypes.func
};

export default QuestionCard;
