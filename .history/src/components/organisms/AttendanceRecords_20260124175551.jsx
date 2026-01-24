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
      setRecords(attendanceData);
      
      // Group records by date
      const grouped = attendanceData.reduce((acc, record) => {
        const date = new Date(record.date).toISOString().split('T')[0];
        
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
    setSelectedDateRecords(dateGroup);
    
    // Initialize edit data with current status
    const initialData = {};
    dateGroup.records.forEach(record => {
      initialData[record.studentId._id || record.studentId] = record.status.toLowerCase();
    });
    
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
        const studentId = record.studentId._id || record.studentId;
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

  // Get chip color based on status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'excused':
        return 'info';
      default:
        return 'default';
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

  // Group records by date for better organization
  const groupedRecords = records.reduce((acc, record) => {
    const date = formatDate(record.date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {});

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Past Attendance Records</Typography>
        {!isAdmin && (
          <Typography variant="body2" color="text.secondary">
            (View Only)
          </Typography>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : records.length === 0 ? (
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
              {Object.entries(groupedRecords).map(([date, dateRecords]) => (
                <React.Fragment key={date}>
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      sx={{ 
                        backgroundColor: 'action.hover',
                        fontWeight: 'bold',
                        py: 1
                      }}
                    >
                      {date}
                    </TableCell>
                  </TableRow>
                  {dateRecords.map((record) => (
                    <TableRow key={record._id || record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        {record.student?.firstName && record.student?.lastName
                          ? `${record.student.firstName} ${record.student.lastName}`
                          : record.studentId?.name || record.studentName || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status || '-'}
                          color={getStatusColor(record.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {record.teacher?.firstName && record.teacher?.lastName
                          ? `${record.teacher.firstName} ${record.teacher.lastName}`
                          : record.markedBy?.name || record.markedByName || '-'}
                      </TableCell>
                      <TableCell>
                        {record.notes || '-'}
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="center">
                          <Tooltip title="Edit Record">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditClick(record)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Attendance Record</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Student"
              value={
                selectedRecord?.student?.firstName && selectedRecord?.student?.lastName
                  ? `${selectedRecord.student.firstName} ${selectedRecord.student.lastName}`
                  : selectedRecord?.studentId?.name || selectedRecord?.studentName || ''
              }
              disabled
              fullWidth
            />
            <TextField
              label="Date"
              value={formatDate(selectedRecord?.date)}
              disabled
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={editFormData.status}
              onChange={(e) => handleFormChange('status', e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="Present">Present</MenuItem>
              <MenuItem value="Absent">Absent</MenuItem>
              <MenuItem value="Late">Late</MenuItem>
              <MenuItem value="Excused">Excused</MenuItem>
            </TextField>
            <TextField
              label="Notes"
              value={editFormData.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveRecord} 
            color="primary"
            disabled={!editFormData.status}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AttendanceRecords;
