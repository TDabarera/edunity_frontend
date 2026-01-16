import React, { useState, useEffect } from 'react';
import { Container, Box, Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import MainLayout from '../components/templates/MainLayout';
import { ClassTable, Toast, ClassForm, Popup } from '../components/organisms';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/organisms/Toast';
import { DeleteClass, GetAllUsers } from '../services';

const ClassManagement = () => {
  const { user } = useAuth();
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [refreshToken, setRefreshToken] = useState('');
  const [confirmDeleteClass, setConfirmDeleteClass] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Fetch teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const response = await GetAllUsers();
        const allUsers = response.users || [];
        const teacherList = allUsers.filter((u) => u.userType === 'Teacher');
        setTeachers(teacherList);
      } catch (error) {
        const errorMsg = error.message || 'Failed to fetch teachers';
        showToast(errorMsg, 'error');
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [showToast]);

  const handleAddClass = () => {
    setShowCreate(true);
  };

  const handleEditClass = (classData) => {
    setEditClass(classData);
  };

  const handleDeleteClass = (classId) => {
    setConfirmDeleteClass(classId);
  };

  const handleTableError = (errorMsg) => {
    showToast(errorMsg, 'error');
  };

  return (
    <MainLayout isLoggedIn={true} user={user}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Class Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, view, and manage all classes and their assigned teachers.
          </Typography>
        </Box>

        <ClassTable
          onAddClass={handleAddClass}
          onEditClass={handleEditClass}
          onDeleteClass={handleDeleteClass}
          onError={handleTableError}
          refreshToken={refreshToken}
        />
      </Container>

      {/* Create Class Modal */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Class</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {loadingTeachers ? (
            <Typography>Loading teachers...</Typography>
          ) : (
            <ClassForm
              onSuccess={(created) => {
                setShowCreate(false);
                showToast('Class created successfully!', 'success');
                setRefreshToken(String(Date.now()));
              }}
              onCancel={() => setShowCreate(false)}
              teachers={teachers}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Class Modal */}
      <Dialog open={!!editClass} onClose={() => setEditClass(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Class</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editClass && (
            <ClassForm
              classData={editClass}
              onSuccess={(updated) => {
                setEditClass(null);
                showToast('Class updated successfully!', 'success');
                setRefreshToken(String(Date.now()));
              }}
              onCancel={() => setEditClass(null)}
              teachers={teachers}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Popup */}
      <Popup
        open={!!confirmDeleteClass}
        title="Delete Class Confirmation"
        description={
          <>
            Are you sure you want to delete this class? <br />
            <br />
            Deleting this class will remove all associated data and cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          try {
            const res = await DeleteClass(confirmDeleteClass);
            showToast(res?.message || 'Class deleted successfully!', 'success');
            setRefreshToken(String(Date.now()));
          } catch (err) {
            const errorMsg = err?.data?.error || err?.message || 'Failed to delete class';
            showToast(errorMsg, 'error');
          } finally {
            setConfirmDeleteClass(null);
          }
        }}
        onCancel={() => setConfirmDeleteClass(null)}
      />

      <ToastComponent open={open} message={message} severity={severity} onClose={closeToast} />
    </MainLayout>
  );
};

export default ClassManagement;
