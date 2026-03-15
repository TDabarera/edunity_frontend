import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid, TablePagination } from '@mui/material';
import { Button, Input, SelectInput } from '../atoms';
import { NotificationLog, NotificationBody } from '../molecules';
import { GetNotifications, GetNotificationById, ResendNotificationById } from '../../services';
import { useToast } from './useToast';
import { useAuth } from '../../context/AuthContext';
import { decodeJWT } from '../../utils/jwtUtils';
import colors from '../../styles/colors';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Sent', value: 'sent' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const INITIAL_FILTERS = {
  status: '',
  recipientEmail: '',
  accountNumber: '',
  subject: '',
};

const getNotificationId = (notification) => {
  return notification?.id || notification?._id || '';
};

const NotificationLogs = () => {
  const { user } = useAuth();
  const { showToast, Toast: ToastComponent } = useToast();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const token = localStorage.getItem('edunity_token');
  const decodedToken = token ? decodeJWT(token) : null;
  const tokenRole = String(
    decodedToken?.role ||
    decodedToken?.userType ||
    decodedToken?.user?.role ||
    decodedToken?.user?.userType ||
    ''
  ).toLowerCase();
  const fallbackRole = String(user?.role || '').toLowerCase();
  const normalizedRole = tokenRole || fallbackRole;
  const canViewNotifications = normalizedRole === 'teacher' || normalizedRole === 'admin';

  const queryParams = useMemo(() => {
    const params = {
      page: page + 1,
      limit: rowsPerPage,
      status: appliedFilters.status ?? '',
    };

    if (appliedFilters.recipientEmail) params.recipientEmail = appliedFilters.recipientEmail.trim();
    if (appliedFilters.accountNumber) params.accountNumber = appliedFilters.accountNumber.trim();
    if (appliedFilters.subject) params.subject = appliedFilters.subject.trim();

    return params;
  }, [appliedFilters, page, rowsPerPage]);

  const fetchNotifications = useCallback(async () => {
    if (!canViewNotifications) {
      setNotifications([]);
      setTotal(0);
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
      setError(err.message || 'Failed to load notification logs');
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [canViewNotifications, queryParams]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleApplyFilters = () => {
    setPage(0);
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setPage(0);
  };

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

  const handleResend = async () => {
    const notificationId = getNotificationId(selectedNotification);
    if (!notificationId) {
      showToast('Notification id is missing.', 'warning');
      return;
    }

    try {
      setResending(true);
      const response = await ResendNotificationById(notificationId);
      showToast(response?.message || 'Notification queued for resend', 'success');
      await fetchNotifications();
    } catch (err) {
      showToast(err.message || 'Failed to resend notification', 'error');
    } finally {
      setResending(false);
    }
  };

  if (!canViewNotifications) {
    return null;
  }

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
        Notification Logs
      </Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={2} sx={{ minWidth: 180 }}>
          <SelectInput
            label="Status"
            value={filters.status}
            onChange={handleFilterChange('status')}
            options={STATUS_OPTIONS}
            SelectProps={{ displayEmpty: true }}
            placeholder="All statuses"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Input
            label="Recipient Email"
            value={filters.recipientEmail}
            onChange={handleFilterChange('recipientEmail')}
            placeholder="person@example.com"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Input
            label="Account Number"
            value={filters.accountNumber}
            onChange={handleFilterChange('accountNumber')}
            placeholder="Account #"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Input
            label="Subject"
            value={filters.subject}
            onChange={handleFilterChange('subject')}
            placeholder="Search by subject"
          />
        </Grid>
        <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={handleResetFilters}>
            Reset
          </Button>
          <Button variant="contained" onClick={handleApplyFilters}>
            Apply
          </Button>
        </Grid>
      </Grid>

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
            No notifications found.
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
              onResend={handleResend}
              onClose={handleCloseNotification}
              resending={resending}
            />
          )}
        </Box>
      )}

      <ToastComponent />
    </Box>
  );
};

export default NotificationLogs;