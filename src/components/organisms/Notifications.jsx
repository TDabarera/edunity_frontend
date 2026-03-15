import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, TablePagination } from '@mui/material';
import { NotificationLog, NotificationBody } from '../molecules';
import { GetNotifications, GetNotificationById } from '../../services';
import { useToast } from './useToast';
import { useAuth } from '../../context/AuthContext';
import colors from '../../styles/colors';

const getNotificationId = (notification) => {
  return notification?.id || notification?._id || '';
};

const Notifications = () => {
  const { user } = useAuth();
  const { showToast, Toast: ToastComponent } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const recipientEmail = String(user?.email || '').trim();

  const queryParams = useMemo(() => {
    return {
      recipientEmail,
      page: page + 1,
      limit: rowsPerPage,
    };
  }, [recipientEmail, page, rowsPerPage]);

  const fetchNotifications = useCallback(async () => {
    if (!recipientEmail) {
      setNotifications([]);
      setTotal(0);
      setError('No recipient email found for the current user.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await GetNotifications(queryParams);
      const list = response?.notifications || [];

      setNotifications(list);
      setTotal(response?.total ?? response?.count ?? list.length);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [queryParams, recipientEmail]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenNotification = async (notification) => {
    const notificationId = getNotificationId(notification);
    if (!notificationId) {
      showToast('Notification id is missing.', 'warning');
      return;
    }

    try {
      setDetailLoading(true);
      const response = await GetNotificationById(notificationId);
      setSelectedNotification(response?.notification || null);
    } catch (err) {
      showToast(err.message || 'Failed to load notification details', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setSelectedNotification(null);
  };

  return (
    <Box sx={{ p: 3, border: `1px solid ${colors.primary.grey}`, borderRadius: 2 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: colors.primary.dark,
          mb: 3,
        }}
      >
        Notifications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
          }}
        >
          <CircularProgress sx={{ color: colors.primary.main }} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            borderRadius: 2,
            border: `1px solid ${colors.primary.grey}`,
            backgroundColor: colors.primary.greyLight,
          }}
        >
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            No notifications found for your account.
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {notifications.map((notification) => (
              <NotificationLog
                key={getNotificationId(notification)}
                notification={notification}
                onClick={() => handleOpenNotification(notification)}
              />
            ))}
          </Box>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleRowsPerPageChange}
            sx={{ mt: 1 }}
          />
        </>
      )}

      {(detailLoading || selectedNotification) && (
        <Box sx={{ mt: 3 }}>
          {detailLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '120px',
              }}
            >
              <CircularProgress sx={{ color: colors.primary.main }} />
            </Box>
          ) : (
            <NotificationBody
              notification={selectedNotification}
              onClose={handleCloseNotification}
              showResend={false}
            />
          )}
        </Box>
      )}

      <ToastComponent />
    </Box>
  );
};

export default Notifications;