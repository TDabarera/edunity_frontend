import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress
} from '@mui/material';
import { Input, SelectInput, Button } from '../atoms';
import { GetAllClasses, GetAllUsers, CreateAttendanceRecord } from '../../services';

const statusOptions = [
  { value: 'Present', label: 'Present' },
  { value: 'Absent', label: 'Absent' },
  { value: 'Late', label: 'Late' },
  { value: 'Excused', label: 'Excused' }
];

const AttendanceForm = ({ open, onClose, onSuccess, onError, teacherRole, teacherId }) => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await GetAllClasses();
        const classList = response?.data || response?.classes || [];
        
        // If teacher, filter to their assigned class
        if (teacherRole === 'Teacher' && teacherId) {
          const teacherClass = classList.find(c => c.teacherId === teacherId);
          setClasses(teacherClass ? [teacherClass] : []);
          if (teacherClass) {
            setSelectedClass(teacherClass._id || teacherClass.id);
          }
        } else {
          setClasses(classList);
        }
      } catch (error) {
        onError(error.message || 'Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchClasses();
    }
  }, [open, teacherRole, teacherId, onError]);

  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }

      try {
        setLoadingStudents(true);
        const response = await GetAllUsers();
        const allUsers = response.users || [];
        
        // Filter students belonging to the selected class
        const classStudents = allUsers.filter(
          user => user.userType === 'Student' && user.classId === selectedClass
        );
        
        setStudents(classStudents);

        // Initialize attendance data with default 'Present' for all students
        const initialAttendance = {};
        classStudents.forEach(student => {
          initialAttendance[student._id || student.id] = 'Present';
        });
        setAttendanceData(initialAttendance);
      } catch (error) {
        onError(error.message || 'Failed to fetch students');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedClass, onError]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      onError('Please select a class');
      return;
    }

    if (students.length === 0) {
      onError('No students found in the selected class');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare attendance records
      const records = students.map(student => ({
        studentId: student._id || student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        classId: selectedClass,
        className: classes.find(c => (c._id || c.id) === selectedClass)?.name || 'Unknown',
        date: selectedDate,
        status: attendanceData[student._id || student.id] || 'Present',
        notes: notes,
        markedBy: teacherRole === 'Teacher' ? 'Teacher' : 'Admin'
      }));

      // Submit all records
      await CreateAttendanceRecord({ records });
      
      onSuccess(`Attendance marked successfully for ${students.length} students`);
      handleClose();
    } catch (error) {
      onError(error.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedClass('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setStudents([]);
    setAttendanceData({});
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Mark Attendance</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <SelectInput
                label="Select Class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={classes.map(c => ({
                  value: c._id || c.id,
                  label: c.name || c.className || 'Unknown'
                }))}
                disabled={loading || (teacherRole === 'Teacher' && classes.length <= 1)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Input
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>

          {loadingStudents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : students.length > 0 ? (
            <>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Students ({students.length})
              </Typography>
              
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {students.map((student) => (
                  <Box
                    key={student._id || student.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      {student.firstName} {student.lastName}
                    </Typography>
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        value={attendanceData[student._id || student.id] || 'Present'}
                        onChange={(e) => handleAttendanceChange(student._id || student.id, e.target.value)}
                      >
                        {statusOptions.map((option) => (
                          <FormControlRole
                            key={option.value}
                            value={option.value}
                            control={<Radio />}
                            label={option.label}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Input
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Box>
            </>
          ) : selectedClass ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No students found in the selected class
              </Typography>
            </Box>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button color="secondary" variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={!selectedClass || students.length === 0 || submitting}
        >
          {submitting ? 'Saving...' : 'Save Attendance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceForm;
