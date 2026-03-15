import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import MainLayout from '../components/templates/MainLayout';
import { PageTitle } from '../components/molecules';
import { useAuth } from '../context/AuthContext';
import { FamilyRestroom } from '@mui/icons-material';

const ParentManagement = () => {
  const { user } = useAuth();

  return (
    <MainLayout isLoggedIn={true} user={user}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageTitle 
          title="Parent Management" 
          subtitle="Manage parent accounts and their connections to students."
        />
        
        <Paper elevation={2} sx={{ p: 4, mt: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '300px',
              gap: 2
            }}
          >
            <FamilyRestroom sx={{ fontSize: 80, color: 'primary.main', opacity: 0.5 }} />
            <Typography variant="h5" color="text.secondary" align="center">
              Parent Management
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 600 }}>
              This feature is coming soon. You will be able to create parent accounts, 
              link them to students, and manage parent-student relationships.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default ParentManagement;
