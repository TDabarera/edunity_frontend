import React, { useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import MainLayout from '../components/templates/MainLayout';
import { MyAccountInformation } from '../components/organisms';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyAccount = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <MainLayout isLoggedIn={isLoggedIn} user={user}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            My Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your personal information and keep your profile up to date.
          </Typography>
        </Box>
        <MyAccountInformation userId={user?.id} />
      </Container>
    </MainLayout>
  );
};

export default MyAccount;
