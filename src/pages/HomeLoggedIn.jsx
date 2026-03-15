import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import MainLayout from '../components/templates/MainLayout';
import { SearchAssignment, DueAssignments, MyAssignments } from '../components/organisms';

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
      <DueAssignments/>
      <SearchAssignment />
      <MyAssignments />

    </MainLayout>
  );
};

export default HomeLoggedIn;
