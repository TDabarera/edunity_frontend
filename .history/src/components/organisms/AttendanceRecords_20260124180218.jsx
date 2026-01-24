import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Button } from '../atoms';
import { TableHeader, AttendanceRowActions } from '../molecules';
import { GetAttendanceByClass, UpdateAttendanceRecord } from '../../services';
import { useAuth } from '../../context/AuthContext';

const AttendanceRecords = ({ classId, onError }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [groupedRecords, setGroupedRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDateRecords, setSelectedDateRecords] = useState(null);
  const [editAttendanceData, setEditAttendanceData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  // Check if user is admin or teacher
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isTeacher = user?.role === 'Teacher' || user?.role === 'teacher';
  const canEdit = isAdmin || isTeacher;

  // Define columns for attendance records table
  const columns = [
    { label: 'Date', align: 'left' },
    { label: 'Marked By', align: 'left' },
    { label: 'Marked Timestamp', align: 'left' },
    ...(canEdit ? [{ label: 'Actions', align: 'center' }] : []),
  ];

  // Fetch all attendance records for the class
  const fetchAttendanceRecords = async () => {
    if (!classId) {
      console.log('[AttendanceRecords] No class selected');
      return;
    }

    console.log('[AttendanceRecords] Fetching records for classId:', classId);

    try {
      setLoading(true);
      const response = await GetAttendanceByClass(classId);
      console.log('[AttendanceRecords] API Response:', response);
      
      const attendanceData = response.attendance || [];
      console.log('[AttendanceRecords] Raw attendance data sample:', attendanceData[0]);
      setRecords(attendanceData);
      
      // Group records by date
      const grouped = attendanceData.reduce((acc, record) => {
        const date = new Date(record.date).toISOString().split('T')[0];
        
        console.log('[AttendanceRecords] Processing record:', {
          date: record.date,
          studentId: record.studentId,
          status: record.status,
          teacher: record.teacher,
          markedBy: record.markedBy
        });
        
        if (!acc[date]) {
          acc[date] = {
            date: record.date,
            markedBy: record.teacher || record.markedBy,
            createdAt: record.createdAt,
            records: []
          };
        }
        
        acc[date].records.push(record);
        return acc;
      }, {});
      
      // Convert to array and sort by date descending
      const groupedArray = Object.values(grouped).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      console.log('[AttendanceRecords] Grouped records:', groupedArray);
      setGroupedRecords(groupedArray);
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch attendance records';
      console.error('[AttendanceRecords] Error:', error);
      onError?.(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, refreshToken]);

  // Handle opening edit dialog
  const handleEditClick = (dateGroup) => {
    console.log('[AttendanceRecords] Edit clicked, dateGroup:', dateGroup);
    console.log('[AttendanceRecords] First record structure:', dateGroup.records[0]);
    setSelectedDateRecords(dateGroup);
    
    // Initialize edit data with current status
    const initialData = {};
    dateGroup.records.forEach(record => {
      console.log('[AttendanceRecords] Full record:', record);
      
      // Try different possible field names
      let studentId = record.studentId || record.student || record.studentID || record.Student;
      
      // Handle both object and string studentId
      if (typeof studentId === 'object' && studentId !== null) {
        studentId = studentId._id || studentId.id;
      }
      
      const status = record.status ? record.status.toLowerCase() : 'present';
      initialData[studentId] = status;
      
      console.log('[AttendanceRecords] Initialized student:', studentId, 'with status:', status);
    });
    
    console.log('[AttendanceRecords] Initial edit data:', initialData);
    setEditAttendanceData(initialData);
    setEditDialogOpen(true);
  };

  // Handle closing edit dialog
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedDateRecords(null);
    setEditAttendanceData({});
  };

  // Handle attendance status change in edit form
  const handleStatusChange = (studentId, status) => {
    setEditAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Handle update attendance
  const handleUpdateAttendance = async () => {
    if (!selectedDateRecords) return;

    try {
      setUpdating(true);
      
      // Update each record
      const updatePromises = selectedDateRecords.records.map(record => {
        const student = record.student || record.studentId;
        const studentId = typeof student === 'object' ? (student._id || student.id) : student;
        const newStatus = editAttendanceData[studentId];
        const recordId = record._id || record.id;
        
        // Only update if status changed
        if (newStatus && newStatus !== record.status.toLowerCase()) {
          return UpdateAttendanceRecord(recordId, {
            status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      
      // Refresh the table
      setRefreshToken(prev => prev + 1);
      handleCloseDialog();
      
      // Show success message
      onError?.('Attendance records updated successfully', 'success');
    } catch (error) {
      const errorMsg = error.message || 'Failed to update attendance records';
      onError?.(errorMsg, 'error');
      console.error('[AttendanceRecords] handleUpdateAttendance error', error);
    } finally {
      setUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format timestamp for display
  const formatTimestamp = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get teacher name
  const getTeacherName = (teacher) => {
    if (!teacher) return '-';
    if (teacher.firstName && teacher.lastName) {
      return `${teacher.firstName} ${teacher.lastName}`;
    }
    if (teacher.name) return teacher.name;
    return '-';
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Past Attendance Records</Typography>
        {!canEdit && (
          <Typography variant="body2" color="text.secondary">
            (View Only)
          </Typography>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : groupedRecords.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No attendance records found for this class
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader columns={columns} />
            <TableBody>
              {groupedRecords.map((dateGroup, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(dateGroup.date)}</TableCell>
                  <TableCell>{getTeacherName(dateGroup.markedBy)}</TableCell>
                  <TableCell>{formatTimestamp(dateGroup.createdAt)}</TableCell>
                  {canEdit && (
                    <TableCell align="center">
                      <Tooltip title="Edit Attendance">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(dateGroup)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Attendance Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Attendance - {selectedDateRecords && formatDate(selectedDateRecords.date)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedDateRecords && selectedDateRecords.records.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHeader columns={[{ label: 'Student Name & Account Number', align: 'left' }]} />
                  <TableBody>
                    {selectedDateRecords.records.map((record) => {
            
                      const student = record.student || record.studentId;
                      let studentId, studentName, accountNumber;
                      
                      if (typeof student === 'object' && student !== null) {
                        studentId = student._id || student.id;
                        studentName = student.firstName && student.lastName 
                          ? `${student.firstName} ${student.lastName}`
                          : student.name || 'Unknown Student';
                        accountNumber = student.accountNumber || student.accountNo || 'N/A';
                      } else {
                        // If student is just a string ID
                        studentId = student;
                        studentName = 'Student ' + studentId;
                        accountNumber = 'N/A';
                      }
                      
                      console.log('[AttendanceRecords] Rendering student:', studentId, 'status:', editAttendanceData[studentId]);
                      
                      return (
                        <TableRow key={record._id || record.id}>
                          <TableCell>
                            <AttendanceRowActions
                              studentName={studentName}
                              accountNumber={accountNumber}
                              initialStatus={editAttendanceData[studentId]}
                              onStatusChange={(status) => handleStatusChange(studentId, status)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No records to edit</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateAttendance} 
            color="primary"
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Attendance'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AttendanceRecords;
