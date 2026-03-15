import React from 'react';
import { Container } from '@mui/material';
import MainLayout from '../components/templates/MainLayout';
import { DashboardOverview } from '../components/organisms';
import { PageTitle } from '../components/molecules';

const HomeLoggedIn = ({ user, role }) => {
  return (
    <MainLayout isLoggedIn={true} user={user}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageTitle
          title="Dashboard"
          subtitle={`Welcome back, ${user?.name || 'User'}! Your ${role || 'user'} overview is ready.`}
        />
        <DashboardOverview user={user} role={role} />
      </Container>
    </MainLayout>
  );
};

export default HomeLoggedIn;
