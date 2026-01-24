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
  TextField
} from '@mui/material';
import { Button } from '../atoms';
import { TableHeader, AttendanceRowActions } from '../molecules';
import { GetAttendanceRecords } from '../../services';

const AttendanceTable = ({ 
  onMarkAttendance, 
  onError, 
  refreshToken, 
  teacherRole, 
  teacherId,
  selectedDate,
  onDateChange
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Define custom columns for attendance table
  const attendanceColumns = [
    { label: 'Student Name', align: 'left' },
    { label: 'Class', align: 'left' },
    { label: 'Date', align: 'left' },
    { label: 'Status', align: 'left' },
    { label: 'Marked By', align: 'left' },
    { label: 'Notes', align: 'left' },
  ];

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = { date: selectedDate };
      
      // If teacher, filter by their class
      if (teacherRole === 'Teacher' && teacherId) {
        params.teacherId = teacherId;
      }

      const response = await GetAttendanceRecords(params);
      setRecords(response.records || []);
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch attendance records';
      onError(errorMsg);
      console.error('[AttendanceTable] fetchAttendance error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken, selectedDate]);

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

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Attendance Records</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button color="primary" onClick={onMarkAttendance}>
            Mark Attendance
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : records.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No attendance records found for {selectedDate}
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader columns={attendanceColumns} />
            <TableBody>
              {records.map((record) => (
                <TableRow key={record._id || record.id}>
                  <TableCell>{record.studentName || 'N/A'}</TableCell>
                  <TableCell>{record.className || 'N/A'}</TableCell>
                  <TableCell>
                    {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={record.status || 'N/A'} 
                      color={getStatusColor(record.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{record.markedBy || 'System'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {record.notes || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default AttendanceTable;
