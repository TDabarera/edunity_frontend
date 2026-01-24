import React, { useState } from 'react';
import { Container, Dialog, DialogContent } from '@mui/material';
import MainLayout from '../components/templates/MainLayout';
import { UserTable, UserForm, Popup, ParentChildrenForm } from '../components/organisms';
import { PageTitle } from '../components/molecules';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/organisms/useToast.jsx';
import { DeleteUser } from '../services';

const ParentManagement = () => {
  const { user } = useAuth();
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [refreshToken, setRefreshToken] = useState('');
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const currentUserId = user?.id || user?._id;

  const handleAddUser = () => {
    setShowCreate(true);
  };

  const handleEditUser = (userData) => {
    setEditUser(userData);
  };

  const handleDeleteUser = (userId) => {
    if (userId === currentUserId) {
      showToast('Cannot delete the currently logged-in user', 'warning');
      return;
    }
    setConfirmDeleteUser(userId);
  };

  const handleTableError = (errorMsg) => {
    showToast(errorMsg, 'error');
  };

  return (
    <MainLayout isLoggedIn={true} user={user}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageTitle 
          title="Parent Management" 
          subtitle="Create, view, and manage parent accounts and their connections to students."
        />
        <UserTable
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onError={handleTableError}
          refreshToken={refreshToken}
          currentUserId={currentUserId}
          filterByRole="Parent"
          hideUserTypeFilter={true}
        />
      </Container>

      {/* Create Parent Modal */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <UserForm
            defaultRole="Parent"
            hideClassField={true}
            showChildrenSelector={true}
            onSuccess={() => {
              setShowCreate(false);
              showToast('Parent created successfully!', 'success');
              setRefreshToken(String(Date.now()));
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add Children Modal */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="md" fullWidth>
        <DialogContent>
          {editUser && (
            <ParentChildrenForm
              parent={editUser}
              onSuccess={() => {
                setEditUser(null);
                showToast('Children updated successfully!', 'success');
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
        title={confirmDeleteUser === user?._id ? "Cannot Delete User" : "Are you sure you want to delete this parent?"}
        description={
          confirmDeleteUser === currentUserId ? (
            <> You cannot delete the currently logged-in user. </>
          ) : (
            <> Deleting this parent will remove all associated data and cannot be undone. </>
          )
        }
        confirmText={confirmDeleteUser === currentUserId ? "OK" : "Delete"}
        cancelText={confirmDeleteUser === currentUserId ? "" : "Cancel"}
        onConfirm={async () => {
          if (confirmDeleteUser === currentUserId) {
            setConfirmDeleteUser(null);
            return;
          }
          try {
            const res = await DeleteUser(confirmDeleteUser);
            showToast(res?.message || 'Parent deleted successfully!', 'success');
            setRefreshToken(String(Date.now()));
          } catch (err) {
            const errorMsg = err?.data?.error || err?.message || 'Failed to delete parent';
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

export default ParentManagement;
