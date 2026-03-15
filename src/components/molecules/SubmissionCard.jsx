import React from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import colors from '../../styles/colors';

const SubmissionCard = ({ submission, classNameLookup = {}, showActions = false, onEdit, onDelete, onClick }) => {
  const assignment = submission?.assignmentId || {};
  const assignmentTitle = assignment?.title ? String(assignment.title).replace(/"/g, '') : 'Untitled Assignment';

  const deadlineDate = assignment?.deadline ? new Date(assignment.deadline) : null;
  const submittedAtDate = submission?.submittedAt ? new Date(submission.submittedAt) : null;
  const lastEditedDate = submission?.lastEditedAt ? new Date(submission.lastEditedAt) : null;

  const formattedDeadline = deadlineDate
    ? deadlineDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const formattedSubmittedAt = submittedAtDate
    ? submittedAtDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const formattedLastEdited = lastEditedDate
    ? lastEditedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

  const getStatusChipColor = () => {
    if (submission?.status === 'On Time') return 'success';
    if (submission?.status === 'Late') return 'warning';
    return 'default';
  };

  const getClassDisplayName = (assignedClass) => {
    if (!assignedClass) return '';

    if (typeof assignedClass === 'object') {
      return assignedClass.className || assignedClass.name || assignedClass.label || assignedClass._id || assignedClass.id || '';
    }

    const classKey = String(assignedClass);
    return classNameLookup[classKey] || classKey;
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        backgroundColor: colors.primary.greyLight,
        border: `1px solid ${colors.primary.grey}`,
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: colors.primary.main,
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {assignmentTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
            Deadline: {formattedDeadline}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
            Submitted At: {formattedSubmittedAt}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            Last Edited: {formattedLastEdited}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center', mb: 2 }}>
          <Chip
            label={submission?.status || 'Unknown'}
            color={getStatusChipColor()}
            size="small"
            variant="outlined"
          />
          <Chip
            label={submission?.isSubmitted ? 'Submitted' : 'Pending'}
            size="small"
            variant="filled"
            sx={{
              color: colors.primary.contrastText,
              backgroundColor: submission?.isSubmitted ? colors.success.main : colors.warning.main,
              fontWeight: 600,
            }}
          />
        </Box>

        {assignment?.assignedToClasses && assignment.assignedToClasses.length > 0 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.secondary, display: 'block', mb: 1 }}>
              Assigned To:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              {assignment.assignedToClasses.map((assignedClass, index) => (
                <Chip
                  key={index}
                  label={getClassDisplayName(assignedClass)}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: colors.primary.main,
                    color: colors.primary.main,
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {showActions && (onEdit || onDelete) && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
            {onEdit && (
              <Tooltip title="Edit Submission">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(submission);
                  }}
                  sx={{
                    color: colors.primary.light,
                    '&:hover': {
                      backgroundColor: colors.primary.grey,
                      color: colors.primary.contrastText,
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip title="Delete Submission">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(submission);
                  }}
                  sx={{
                    color: colors.primary.main,
                    '&:hover': {
                      backgroundColor: colors.primary.main,
                      color: colors.primary.contrastText,
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SubmissionCard;
