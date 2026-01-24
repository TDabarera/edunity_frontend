import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Divider, Grid } from '@mui/material';
import { Input, Button } from '../atoms';
import { GetAllUsers, GetAllClasses, UpdateUserChildren } from '../../services';
import { useToast } from './useToast.jsx';
import Popup from './Popup';

const ParentChildrenForm = ({ parent, onSuccess, onCancel }) => {
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, classesRes] = await Promise.all([
          GetAllUsers(),
          GetAllClasses()
        ]);

        const allUsers = usersRes?.users || [];
        const allClasses = classesRes?.data || classesRes?.classes || [];
        setClasses(allClasses);

        const studentList = allUsers.filter(u => (u.userType || '').toLowerCase() === 'student');
        setStudents(studentList);
        setAllStudents(studentList);

        // Pre-select existing children
        if (parent?.children && Array.isArray(parent.children)) {
          setSelectedChildren(parent.children);
        }
      } catch (err) {
        const errorMsg = err?.data?.error || err?.message || 'Failed to fetch students';
        showToast(errorMsg, 'error');
      }
    };

    fetchData();
  }, [parent, showToast]);

  const getClassName = (classId) => {
    if (!classId) return 'No class';
    const classObj = classes.find(c => c._id === classId);
    if (!classObj) return 'No class';
    return classObj.className || `${classObj.level || ''}${classObj.order || ''} ${classObj.year || ''}`.trim() || 'No class';
  };

  const handleChildrenChange = (studentId) => {
    setSelectedChildren(prev => {
      const isSelected = prev.includes(studentId);
      return isSelected
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId];
    });
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (!searchTerm) {
      setStudents(allStudents);
      return;
    }
    
    const filtered = allStudents.filter(s => {
      const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      const accountNo = (s.accountNumber || s.accountNo || '').toLowerCase();
      const className = getClassName(s.classId).toLowerCase();
      return name.includes(searchTerm) || accountNo.includes(searchTerm) || className.includes(searchTerm);
    });
    setStudents(filtered);
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const handleConfirmAdd = async () => {
    setShowPopup(false);
    
    try {
      setSubmitting(true);
      const res = await UpdateUserChildren(parent._id, selectedChildren);
      const successMsg = res?.message || 'Children added successfully!';
      showToast(successMsg, 'success');
      if (onSuccess) onSuccess(res);
    } catch (err) {
      const errorMsg = err?.data?.error || err?.message || 'Failed to update children';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAdd = () => {
    setShowPopup(false);
  };

  return (
    <Card elevation={0} sx={{ p: 4, m: 0, boxShadow: 'none', borderRadius: 0 }}>
      <CardHeader
        title="Manage Children"
        subheader={`Select students for ${parent?.firstName || ''} ${parent?.lastName || ''}`}
        sx={{ backgroundColor: 'white' }}
      />
      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleAddClick}>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Input
                    label="Search Students"
                    placeholder="Search by name, account number, or class"
                    onChange={handleSearch}
                  />
                </Box>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {students.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                      No students found
                    </Box>
                  ) : (
                    students.map(student => (
                      <Box
                        key={student._id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedChildren.includes(student._id)}
                          onChange={() => handleChildrenChange(student._id)}
                          style={{ marginRight: 10 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box>{`${student.firstName || ''} ${student.lastName || ''}`.trim()}</Box>
                          <Box sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                            {student.accountNumber || student.accountNo || 'N/A'} | {getClassName(student.classId)}
                          </Box>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
                <Box sx={{ mt: 1, fontSize: '0.85rem', color: 'text.secondary' }}>
                  {selectedChildren.length} student(s) selected
                </Box>
              </Box>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                {onCancel && (
                  <Button variant="outlined" onClick={onCancel} disabled={submitting}>
                    Cancel
                  </Button>
                )}
                <Button variant="contained" type="submit" onClick={handleAddClick} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Children'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>

      <ToastComponent open={open} message={message} severity={severity} onClose={closeToast} />
      <Popup
        open={showPopup}
        title="Add Children"
        description={`Are you sure you want to link ${selectedChildren.length} student(s) to this parent?`}
        onConfirm={handleConfirmAdd}
        onCancel={handleCancelAdd}
        confirmText="Add"
        cancelText="Cancel"
      />
    </Card>
  );
};

export default ParentChildrenForm;
