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
  TextField,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Button } from '../atoms';
import { TableHeader } from '../molecules';
import { GetAttendanceByClass, UpdateAttendanceRecord } from '../../services';
import { useAuth } from '../../context';

const AttendanceRecords = ({ classId, onError }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    notes: ''
  });
  const [refreshToken, setRefreshToken] = useState(0);

  // Check if user is admin
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';

  // Define columns for attendance records table
  const columns = [
    { label: 'Date', align: 'left' },
    { label: 'Student Name', align: 'left' },
    { label: 'Status', align: 'left' },
    { label: 'Marked By', align: 'left' },
    { label: 'Notes', align: 'left' },
    ...(isAdmin ? [{ label: 'Actions', align: 'center' }] : []),
  ];

  // Fetch all attendance records for the class
  const fetchAttendanceRecords = async () => {
    if (!classId) {
      onError?.('No class selected');
      return;
    }

    try {
      setLoading(true);
      // API call to get all attendance by class ID
      const response = await GetAttendanceByClass(classId);
      
      // Response structure: { status, count, attendance: [] }
      // Sort records by date in descending order (most recent first)
      const sortedRecords = (response.attendance || []).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      setRecords(sortedRecords);
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch attendance records';
      onError?.(errorMsg);
      console.error('[AttendanceRecords] fetchAttendanceRecords error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, refreshToken]);

  // Handle opening edit dialog
  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setEditFormData({
      status: record.status || '',
      notes: record.notes || ''
    });
    setEditDialogOpen(true);
  };

  // Handle closing edit dialog
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedRecord(null);
    setEditFormData({
      status: '',
      notes: ''
    });
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save/update attendance record
  const handleSaveRecord = async () => {
    if (!selectedRecord) return;

    try {
      setLoading(true);
      // API call to update attendance record
      await UpdateAttendanceRecord(selectedRecord._id || selectedRecord.id, {
        status: editFormData.status,
        notes: editFormData.notes
      });

      // Refresh the table
      setRefreshToken(prev => prev + 1);
      handleCloseDialog();
      
      // Show success message
      onError?.('Attendance record updated successfully', 'success');
    } catch (error) {
      const errorMsg = error.message || 'Failed to update attendance record';
      onError?.(errorMsg);
      console.error('[AttendanceRecords] handleSaveRecord error', error);
    } finally {
      setLoading(false);
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
                        {record.studentId?.name || record.studentName || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status || '-'}
                          color={getStatusColor(record.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {record.markedBy?.name || record.markedByName || '-'}
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
              value={selectedRecord?.studentId?.name || selectedRecord?.studentName || ''}
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
