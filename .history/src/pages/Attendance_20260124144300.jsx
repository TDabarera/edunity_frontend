import React, { useEffect, useState } from 'react';
import { Container, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import { PageTitle, SelectClass, AttendanceRowActions } from '../components/molecules';
import { AttendanceTable, Toast } from '../components/organisms';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/organisms/Toast';
import { GetAllUsers, CreateAttendanceRecord } from '../services';
import { Button } from '../components/atoms';

const Attendance = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { showToast, Toast: ToastComponent } = useToast();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshToken, setRefreshToken] = useState('');
  const [showMarkDialog, setShowMarkDialog] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleMarkAttendance = () => {
    // TODO: Open attendance marking form
    console.log('Mark attendance for class:', selectedClass);
  };

  const handleError = (errorMsg) => {
    console.error('Attendance error:', errorMsg);
  };

  return (
    <MainLayout isLoggedIn={isLoggedIn} user={user}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <PageTitle 
          title="Attendance Management" 
          subtitle="Track and manage student attendance"
        />

        <Box sx={{ mb: 3 }}>
          <SelectClass
            value={selectedClass}
            onChange={setSelectedClass}
            label="Select Class"
          />
        </Box>

        <AttendanceTable
          onMarkAttendance={handleMarkAttendance}
          onError={handleError}
          refreshToken={refreshToken}
          teacherRole={user?.role}
          teacherId={user?.id}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </Container>
    </MainLayout>
  );
};

export default Attendance;
