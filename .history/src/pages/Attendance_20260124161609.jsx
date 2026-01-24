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

        console.log('[Attendance] Found students:', classStudents.length);
        setStudents(classStudents);

        // Initialize attendance data with 'present' as default
        const initialData = {};
        classStudents.forEach(student => {
          initialData[student._id || student.id] = 'present';
        });
        setAttendanceData(initialData);

        if (classStudents.length > 0) {
          showToast(`Loaded ${classStudents.length} students`, 'info');
        }
      } catch (error) {
        console.error('[Attendance] Error fetching students:', error);
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
      
      const attendanceRecords = students.map(student => {
        const status = attendanceData[student._id || student.id] || 'present';
        return {
          studentId: student._id || student.id,
          status: status.charAt(0).toUpperCase() + status.slice(1) // Capitalize: "present" -> "Present"
        };
      });

      const payload = {
        classId: selectedClass,
        date: selectedDate,
        markedBy: user?._id || user?.id,
        attendanceRecords: attendanceRecords
      };

      console.log('[Attendance] Students count:', students.length);
      console.log('[Attendance] Attendance records array:', attendanceRecords);
      console.log('[Attendance] Payload being sent:', JSON.stringify(payload, null, 2));
      
      const response = await CreateAttendanceRecord(payload);
      console.log('[Attendance] Response:', response);
      
      // Check if the server returned status: false (business logic error)
      if (response.status === false) {
        showToast(response.message || 'Failed to save attendance', 'warning');
      } else {
        showToast(response.message || `Attendance marked for ${students.length} students`, 'success');
      }
    } catch (error) {
      console.error('[Attendance] Error:', error);
      console.error('[Attendance] Error data:', error.data);
      console.log('[Attendance] About to show toast with message:', error.message);
      showToast(error.message || 'Failed to save attendance', 'error');
      console.log('[Attendance] showToast called');
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

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <SelectClass
              value={selectedClass}
              onChange={setSelectedClass}
              label="Select Class"
            />
          </Box>
          <Box>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '16px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </Box>
        </Box>

        <Paper elevation={2} sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : !selectedClass ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Please select a class to view students
              </Typography>
            </Box>
          ) : students.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No students found in this class
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHeader columns={attendanceColumns} />
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

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  onClick={handleSaveAttendance} 
                  disabled={submitting}
                  size="large"
                >
                  {submitting ? 'Saving...' : 'Save Attendance'}
                </Button>
              </Box>
            </>
          )}
        </Paper>

        <ToastComponent />
      </Container>
    </MainLayout>
  );
};

export default Attendance;
