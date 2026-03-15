import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, IconButton, Tooltip, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import colors from '../../styles/colors';

const AssignmentCard = ({ assignment, onClick, onEdit, onDelete, showActions = false, classNameLookup = {} })=> {
  const { title, deadline, uploadedBy, submissionStatus, isSubmitted, assignedToClasses } = assignment;

  // Format deadline date
  const deadlineDate = new Date(deadline);
  const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine chip color based on submission status
  const getStatusChipColor = () => {
    if (submissionStatus === 'On Time') return 'success';
    if (submissionStatus === 'Late') return 'error';
    if (submissionStatus === 'Not Submitted') return 'warning';
    return 'default';
  };

  // Get initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-4px)',
        },
        backgroundColor: colors.primary.greyLight,
        border: `1px solid ${colors.primary.grey}`,
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
            {title?.replace(/"/g, '')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: colors.primary.main,
              fontWeight: 600,
              mb: 1,
            }}
          >
            Deadline: {formattedDeadline}
          </Typography>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: colors.primary.main,
              color: colors.primary.contrastText,
              fontSize: '0.875rem',
            }}
          >
            {getInitials(uploadedBy?.firstName, uploadedBy?.lastName)}
          </Avatar>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {uploadedBy?.firstName} {uploadedBy?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text.secondary, display: 'block' }}>
              {uploadedBy?.email}
            </Typography>
          </Box>
        </Box>

        {(submissionStatus || isSubmitted !== undefined) && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            {submissionStatus && (
              <Chip
                label={submissionStatus}
                color={getStatusChipColor()}
                size="small"
                variant="outlined"
              />
            )}
            {isSubmitted !== undefined && (
              <Chip
                label={isSubmitted ? 'Submitted' : 'Pending'}
                size="small"
                variant="filled"
                sx={{
                  color: colors.primary.contrastText,
                  backgroundColor: isSubmitted ? colors.success.main : colors.warning.main,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        )}

        {assignedToClasses && assignedToClasses.length > 0 && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.secondary, display: 'block', mb: 1 }}>
              Assigned To:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              {assignedToClasses.map((assignedClass, index) => (
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
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(assignment);
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
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(assignment);
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

export default AssignmentCard;
