import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import colors from '../../styles/colors';

const formatWhen = (value) => {
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

const getStatusColor = (status) => {
  const normalizedStatus = String(status || '').toLowerCase();
  if (normalizedStatus === 'sent') return 'success';
  if (normalizedStatus === 'failed' || normalizedStatus === 'cancelled') return 'error';
  if (normalizedStatus === 'processing') return 'warning';
  return 'default';
};

const NotificationLog = ({ notification, onClick }) => {
  const sentTo = notification?.sentTo || {};
  const parentName = sentTo.parentName || 'N/A';
  const studentName = sentTo.studentName || 'N/A';
  const recipientEmail = notification?.recipientEmail || 'N/A';
  const when = notification?.createdAt || notification?.updatedAt || notification?.scheduledFor;
  const status = notification?.status || 'pending';

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        border: `1px solid ${colors.primary.grey}`,
        borderRadius: 2,
        backgroundColor: '#fff',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: colors.primary.greyLight,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.primary.dark }}>
            {notification?.subject || 'No Subject'}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            Student: {studentName}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            Parent: {parentName}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            Recipient: {recipientEmail}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            When: {formatWhen(when)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Chip
            label={String(status).toUpperCase()}
            size="small"
            color={getStatusColor(status)}
            variant="outlined"
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default NotificationLog;