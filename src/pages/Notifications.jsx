import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import { PageTitle } from '../components/molecules';
import { Notifications, NotificationLogs } from '../components/organisms';
import { useAuth } from '../context/AuthContext';
import { decodeJWT } from '../utils/jwtUtils';

const NotificationsPage = () => {
  const { isLoggedIn, isAuthInitialized, user } = useAuth();
  const navigate = useNavigate();

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

  const canViewLogs = normalizedRole === 'admin' || normalizedRole === 'teacher';

  useEffect(() => {
    if (isAuthInitialized && !isLoggedIn) {
      navigate('/login');
    }
  }, [isAuthInitialized, isLoggedIn, navigate]);

  if (!isAuthInitialized || !isLoggedIn) return null;

  return (
    <MainLayout isLoggedIn={isLoggedIn} user={user}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageTitle
          title="Notifications"
          subtitle="View your notifications and, for teachers/admins, full notification processing logs."
        />

        <Box sx={{ mt: 3 }}>
          <Notifications />
        </Box>

        {canViewLogs && (
          <Box sx={{ mt: 3 }}>
            <NotificationLogs />
          </Box>
        )}
      </Container>
    </MainLayout>
  );
};

export default NotificationsPage;