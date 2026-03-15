import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { Button } from '../atoms';
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

const NotificationBody = ({ notification, onResend, onClose, resending = false, showResend = true }) => {
  const sentTo = notification?.sentTo || {};
  const bodyText = notification?.body?.text || notification?.text || '';
  const bodyHtml = notification?.body?.html || notification?.html || '';
  const content = bodyText || bodyHtml || 'No body content available.';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: `1px solid ${colors.primary.grey}`,
        borderRadius: 2,
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h6" sx={{ color: colors.primary.dark, fontWeight: 700, mb: 1 }}>
        {notification?.subject || 'Notification'}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip
          label={String(notification?.status || 'pending').toUpperCase()}
          size="small"
          color={getStatusColor(notification?.status)}
          variant="outlined"
        />
      </Box>

      <Typography variant="body2" sx={{ color: colors.text.secondary }}>
        Student: {sentTo.studentName || 'N/A'}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.text.secondary }}>
        Parent: {sentTo.parentName || 'N/A'}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.text.secondary }}>
        Recipient: {notification?.recipientEmail || 'N/A'}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
        Created: {formatWhen(notification?.createdAt)}
      </Typography>

      <Box
        sx={{
          p: 2,
          borderRadius: 1,
          border: `1px solid ${colors.primary.grey}`,
          backgroundColor: colors.primary.greyLight,
          maxHeight: 320,
          overflowY: 'auto',
          mb: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: colors.text.primary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {content}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>
          Back
        </Button>
        {showResend && (
          <Button variant="contained" onClick={onResend} disabled={resending}>
            {resending ? 'Resending...' : 'Resend'}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default NotificationBody;