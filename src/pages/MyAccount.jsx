import React, { useEffect } from 'react';
import { Container } from '@mui/material';
import MainLayout from '../components/templates/MainLayout';
import { MyAccountInformation } from '../components/organisms';
import { PageTitle } from '../components/molecules';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyAccount = () => {
  const { isLoggedIn, isAuthInitialized, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthInitialized && !isLoggedIn) {
      navigate('/login');
    }
  }, [isAuthInitialized, isLoggedIn, navigate]);

  if (!isAuthInitialized || !isLoggedIn) return null;

  return (
    <MainLayout isLoggedIn={isLoggedIn} user={user}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <PageTitle 
          title="My Account" 
          subtitle="Manage your personal information and keep your profile up to date."
        />
        <MyAccountInformation userId={user?.id} />
      </Container>
    </MainLayout>
  );
};

export default MyAccount;
