import React, { useEffect } from 'react';
import { Container, Box, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import { PageTitle } from '../components/molecules';
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

          <Paper 
            elevation={3} 
            sx={{ 
              p: 6, 
              maxWidth: 600, 
              mx: 'auto',
              backgroundColor: '#f5f5f5'
            }}
          >
            <Typography variant="h5" gutterBottom>
              Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This page is under development. Attendance tracking features will be available soon.
            </Typography>
            
            {user?.role === 'Teacher' && (
              <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
                Teachers will be able to mark and view attendance for their assigned classes.
              </Alert>
            )}

            {user?.role === 'Admin' && (
              <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
                Admins will be able to view and manage attendance for all classes.
              </Alert>
            )}
          </Paper>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default Attendance;
