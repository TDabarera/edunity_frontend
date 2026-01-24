import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import { AttendanceTable, AttendanceForm, Toast } from '../components/organisms';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/organisms/Toast';

const Attendance = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { showToast, Toast: ToastComponent } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [refreshToken, setRefreshToken] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Check if user has permission to view this page
  useEffect(() => {
    if (!isLoggedIn) {
      showToast('Please login to access this page', 'warning');
      navigate('/login');
      return;
    }

    if (user?.role !== 'Teacher' && user?.role !== 'Admin') {
      showToast('Access denied. Only teachers and admins can view attendance.', 'error');
      navigate('/');
    }
  }, [isLoggedIn, user, navigate, showToast]);

  // Don't render if user doesn't have permission
  if (!isLoggedIn || (user?.role !== 'Teacher' && user?.role !== 'Admin')) {
    return null;
  }

  const handleMarkAttendance = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleFormSuccess = (message) => {
    setShowForm(false);
    showToast(message, 'success');
    setRefreshToken(Date.now().toString());
  };

  const handleFormError = (errorMsg) => {
    showToast(errorMsg, 'error');
  };

  const handleTableError = (errorMsg) => {
    showToast(errorMsg, 'error');
  };

  return (
    <MainLayout isLoggedIn={isLoggedIn} user={user}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Attendance Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Track and manage student attendance records
          </Typography>

          {user?.role === 'Teacher' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              You can view and mark attendance for students in your assigned class.
            </Alert>
          )}

          {user?.role === 'Admin' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              As an admin, you can view and manage attendance for all classes.
            </Alert>
          )}
        </Box>

        <AttendanceTable
          onMarkAttendance={handleMarkAttendance}
          onError={handleTableError}
          refreshToken={refreshToken}
          teacherRole={user?.role}
          teacherId={user?.id}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {showForm && (
          <AttendanceForm
            open={showForm}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
            onError={handleFormError}
            teacherRole={user?.role}
            teacherId={user?.id}
          />
        )}

        <ToastComponent />
      </Container>
    </MainLayout>
  );
};

export default Attendance;
