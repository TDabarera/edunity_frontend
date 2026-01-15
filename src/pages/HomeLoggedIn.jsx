import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import MainLayout from '../components/templates/MainLayout';

const HomeLoggedIn = ({ user }) => {
  return (
    <MainLayout isLoggedIn={true} user={user}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1">
          This is the logged-in home page content.
        </Typography>
      </Container>
    </MainLayout>
  );
};

export default HomeLoggedIn;
