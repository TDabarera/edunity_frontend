import React, { useEffect } from 'react';
import { Container, Box, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import { PageTitle, SelectClass } from '../components/molecules';
import { AttendanceTable } from '../components/organisms';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Check if user has permission to view this page
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'Teacher' && user?.role !== 'Admin') {
      navigate('/');
    }
  }, [isLoggedIn, user, navigate]);

  // Don't render if user doesn't have permission
  if (!isLoggedIn || (user?.role !== 'Teacher' && user?.role !== 'Admin')) {
    return null;
  }

  return (
    <MainLayout isLoggedIn={isLoggedIn} user={user}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box>
          <PageTitle 
            title="Attendance Management" 
            subtitle="Track and manage student attendance"
          />
        </Box>

          
      </Container>
    </MainLayout>
  );
};

export default Attendance;
