import React from 'react';
import { Box, Paper, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { Visibility as VisibilityIcon, Download as DownloadIcon } from '@mui/icons-material';
import colors from '../../styles/colors';

const formatDate = (value) => {
  if (!value) return 'N/A';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStudentName = (student) => {
  if (!student || typeof student !== 'object') return 'Unknown Student';
  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
  return fullName || 'Unknown Student';
};

const getStudentClass = (classId, classNameLookup = {}) => {
  if (!classId) return 'N/A';

  if (typeof classId === 'object') {
    const resolvedClassId = classId._id || classId.id || '';
    return classId.className || classId.name || classNameLookup[String(resolvedClassId)] || resolvedClassId || 'N/A';
  }

  const classKey = String(classId);
  return classNameLookup[classKey] || classKey;
};

const getStatusColor = (status) => {
  if (status === 'On Time') return 'success';
  if (status === 'Late') return 'warning';
  return 'default';
};

const SubmissionActionRow = ({ submission, classNameLookup = {}, onView, onDownload }) => {
  const student = submission?.studentId;
  const studentName = getStudentName(student);
  const studentEmail = student?.email || 'N/A';
  const studentClass = getStudentClass(student?.classId, classNameLookup);
  const status = submission?.status || 'Unknown';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: `1px solid ${colors.primary.grey}`,
        backgroundColor: colors.primary.greyLight,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.primary.main }}>
            {studentName}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            {studentEmail}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            Class: {studentClass}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            Submitted: {formatDate(submission?.submittedAt)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          <Chip label={status} size="small" color={getStatusColor(status)} variant="outlined" />
          <Tooltip title="View">
            <IconButton size="small" onClick={() => onView?.(submission)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={() => onDownload?.(submission)}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default SubmissionActionRow;