import React, { useState } from 'react';
import { Container, Box, Dialog, DialogTitle, DialogContent } from '@mui/material';
import MainLayout from '../components/templates/MainLayout';
import { UserTable, Toast, UserForm, Popup } from '../components/organisms';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/organisms/Toast';
import { DeleteUser } from '../services';

const UserManagement = () => {
  const { user } = useAuth();
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [refreshToken, setRefreshToken] = useState('');
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const handleAddUser = () => {
    setShowCreate(true);
  };

  const handleEditUser = (userData) => {
    setEditUser(userData);
  };

  const handleDeleteUser = (userId) => {
    setConfirmDeleteUser(userId);
  };

  const handleTableError = (errorMsg) => {
    showToast(errorMsg, 'error');
  };

  return (
    <MainLayout isLoggedIn={true} user={user}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <UserTable
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onError={handleTableError}
          refreshToken={refreshToken}
        />
      </Container>

      {/* Create User Modal */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <UserForm
            onSuccess={(created) => {
              setShowCreate(false);
              showToast('User created successfully!', 'success');
              setRefreshToken(String(Date.now()));
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && (
            <UserForm
              user={editUser}
              onSuccess={(updated) => {
                setEditUser(null);
                showToast('User updated successfully!', 'success');
                setRefreshToken(String(Date.now()));
              }}
              onCancel={() => setEditUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Popup */}
      <Popup
        open={!!confirmDeleteUser}
        title="Are you sure you want to delete this user?"
        description= <> Deleting this user will remove all associated data and cannot be undone. </>
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          try {
            const res = await DeleteUser(confirmDeleteUser);
            showToast(res?.message || 'User deleted successfully!', 'success');
            setRefreshToken(String(Date.now()));
          } catch (err) {
            const errorMsg = err?.data?.error || err?.message || 'Failed to delete user';
            showToast(errorMsg, 'error');
          } finally {
            setConfirmDeleteUser(null);
          }
        }}
        onCancel={() => setConfirmDeleteUser(null)}
      />

      <ToastComponent open={open} message={message} severity={severity} onClose={closeToast} />
    </MainLayout>
  );
};

export default UserManagement;
