import React, { useEffect, useState } from 'react';
import { Container, Box, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import { PageTitle, SelectClass, AttendanceRowActions, TableHeader } from '../components/molecules';
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

  // Define columns for attendance marking table
  const markAttendanceColumns = [
    { label: 'Student', align: 'left' },
    { label: 'Actions', align: 'center' },
  ];

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

  const handleMarkAttendance = async () => {
    if (!selectedClass) {
      showToast('Please select a class first', 'warning');
      return;
    }

    try {
      // Fetch students for the selected class
      const response = await GetAllUsers();
      const allUsers = response.users || [];
      const classStudents = allUsers.filter(
        u => u.userType === 'Student' && u.classId === selectedClass
      );

      if (classStudents.length === 0) {
        showToast('No students found in this class', 'info');
        return;
      }

      setStudents(classStudents);
      
      // Initialize attendance data with 'present' as default
      const initialData = {};
      classStudents.forEach(student => {
        initialData[student._id || student.id] = 'present';
      });
      setAttendanceData(initialData);
      setShowMarkDialog(true);
    } catch (error) {
      showToast(error.message || 'Failed to load students', 'error');
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSubmitting(true);
      
      const records = students.map(student => ({
        studentId: student._id || student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        classId: selectedClass,
        date: selectedDate,
        status: attendanceData[student._id || student.id] || 'present',
        markedBy: `${user?.role}`
      }));

      await CreateAttendanceRecord({ records });
      
      showToast(`Attendance marked for ${students.length} students`, 'success');
      setShowMarkDialog(false);
      setRefreshToken(Date.now().toString());
    } catch (error) {
      showToast(error.message || 'Failed to save attendance', 'error');
    } finally {
      setSubmitting(false);
    }
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

        {/* Mark Attendance Dialog */}
        <Dialog open={showMarkDialog} onClose={() => setShowMarkDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Mark Attendance - {selectedDate}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {students.map((student) => (
                <AttendanceRowActions
                  key={student._id || student.id}
                  studentName={`${student.firstName} ${student.lastName}`}
                  accountNumber={student.accountNumber || student.accountNo || 'N/A'}
                  initialStatus={attendanceData[student._id || student.id]}
                  onStatusChange={(status) => handleStatusChange(student._id || student.id, status)}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" onClick={() => setShowMarkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAttendance} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Attendance'}
            </Button>
          </DialogActions>
        </Dialog>

        <ToastComponent />
      </Container>
    </MainLayout>
  );
};

export default Attendance;
