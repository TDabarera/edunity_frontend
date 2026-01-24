import React, { useEffect, useState } from 'react';
import { Container, Box, Table, TableBody, TableCell, TableContainer, TableRow, Paper, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import { PageTitle, SelectClass, AttendanceRowActions, TableHeader } from '../components/molecules';
import { Toast } from '../components/organisms';
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
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define columns for attendance marking table
  const attendanceColumns = [
    { label: 'Student Name & Account', align: 'left' },
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

  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }

      try {
        setLoading(true);
        const response = await GetAllUsers();
        const allUsers = response.users || [];
        const classStudents = allUsers.filter(
          u => u.userType === 'Student' && u.classId === selectedClass
        );

        setStudents(classStudents);

        // Initialize attendance data with 'present' as default
        const initialData = {};
        classStudents.forEach(student => {
          initialData[student._id || student.id] = 'present';
        });
        setAttendanceData(initialData);
      } catch (error) {
        showToast(error.message || 'Failed to load students', 'error');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, showToast]);

  // Don't render if user doesn't have permission
  if (!isLoggedIn || (user?.role !== 'Teacher' && user?.role !== 'Admin')) {
    return null;
  }

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      showToast('Please select a class', 'warning');
      return;
    }

    if (students.length === 0) {
      showToast('No students to mark attendance for', 'warning');
      return;
    }

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
    } catch (error) {
      showToast(error.message || 'Failed to save attendance', 'error');
    } finally {
      setSubmitting(false);
    }
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
            <Paper elevation={0} sx={{ mt: 2 }}>
              <TableContainer>
                <Table>
                  <TableHeader columns={markAttendanceColumns} />
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student._id || student.id}>
                        <TableCell>
                          <AttendanceRowActions
                            studentName={`${student.firstName} ${student.lastName}`}
                            accountNumber={student.accountNumber || student.accountNo || 'N/A'}
                            initialStatus={attendanceData[student._id || student.id]}
                            onStatusChange={(status) => handleStatusChange(student._id || student.id, status)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
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
