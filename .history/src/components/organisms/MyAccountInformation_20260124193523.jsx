import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, CardHeader, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import { Input, Button, SelectInput, Skeleton } from '../atoms';
import { ParentChildren } from '../molecules';
import { GetUserById, UpdateUserById } from '../../services';
import { useToast } from './useToast.jsx';
import { useAuth } from '../../context/AuthContext';
import Popup from './Popup';
import colors from '../../styles/colors';

const userTypeOptions = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Teacher', value: 'Teacher' },
  { label: 'Student', value: 'Student' },
  { label: 'Parent', value: 'Parent' },
];

const MyAccountInformation = ({ userId: userIdProp }) => {
  const { user, updateProfile } = useAuth();
  const userId = userIdProp || user?.id || user?._id;
  
  //console.log('MyAccountInformation rendering:', { userId, user });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    accountNumber: '',
    userType: '',
    email: '',
    phone: '',
    address: '',
    createdAt: '',
    updatedAt: '',
    children: [],
  });
  const [initialData, setInitialData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const loadUser = useCallback(async () => {
    if (!userId) {
      setError('User information is unavailable. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      //console.log('Loading user:', userId);
      setLoading(true);
      setError('');
      const res = await GetUserById(userId);
      console.log('[MyAccountInformation] User loaded:', res);
      const data = res?.user || {};
      console.log('[MyAccountInformation] User data:', data);
      console.log('[MyAccountInformation] Children:', data.children);
      const nextState = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        accountNumber: data.accountNumber || '',
        userType: data.userType || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
        children: data.children || [],
      };
      setForm(nextState);
      setInitialData(nextState);
      const displayName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email;
      if (updateProfile) {
        updateProfile({
          id: data._id || data.id || userId,
          email: data.email,
          role: data.userType,
          name: displayName,
          classId: data.classId,
        });
      }
    } catch (err) {
      //console.error('Error loading user:', err);
      const errMsg = err?.message || 'Failed to load account information';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, updateProfile, userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const canSave = useMemo(() => {
    const required = ['firstName', 'lastName', 'email'];
    return required.every((field) => (form[field] || '').toString().trim().length > 0);
  }, [form]);

  const handleReset = () => {
    if (initialData) setForm(initialData);
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    if (!canSave || !userId) return;
    setShowPopup(true);
  };

  const handleConfirmSave = async () => {
    setShowPopup(false);
    if (!canSave || !userId) return;
    try {
      setSaving(true);
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        accountNumber: form.accountNumber,
        userType: form.userType,
        email: form.email,
        phone: form.phone,
        address: form.address,
      };
      const res = await UpdateUserById(userId, payload);
      const updatedUser = res?.user || payload;
      const successMsg = res?.message || 'Account updated successfully';
      showToast(successMsg, 'success');
      const merged = {
        ...form,
        ...updatedUser,
        updatedAt: updatedUser.updatedAt || new Date().toISOString(),
      };
      setForm((prev) => ({ ...prev, ...merged }));
      setInitialData((prev) => ({ ...prev, ...merged }));
      const displayName = [merged.firstName, merged.lastName].filter(Boolean).join(' ') || merged.email;
      if (updateProfile) {
        updateProfile({
          id: updatedUser._id || updatedUser.id || userId,
          email: merged.email,
          role: merged.userType,
          name: displayName,
          classId: merged.classId,
        });
      }
    } catch (err) {
      const errMsg = err?.message || 'Failed to update account';
      showToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSave = () => {
    setShowPopup(false);
  };

  const metaRow = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="caption" color="text.secondary">Account Number</Typography>
        <Typography variant="body2" fontWeight={600}>{form.accountNumber || '—'}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="caption" color="text.secondary">User Type</Typography>
        <Typography variant="body2" fontWeight={600}>{form.userType || '—'}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="caption" color="text.secondary">Last Updated</Typography>
        <Typography variant="body2" fontWeight={600}>
          {form.updatedAt ? new Date(form.updatedAt).toLocaleString() : '—'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Card elevation={4} sx={{ p: 4 }}>
      <CardHeader
        title="My Account Information"
        subheader="View and edit your profile details"
        sx={{ backgroundColor: 'white'}}
      />
      <CardContent>
        {loading ? (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="60%" height={24} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="60%" height={24} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="80%" height={24} />
              </Box>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
              <Grid item xs={12}>
                <Skeleton variant="rectangular" height={80} />
              </Grid>
            </Grid>
            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
              <Skeleton variant="rectangular" width={100} height={42} />
              <Skeleton variant="rectangular" width={140} height={42} />
            </Stack>
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ py: 2 }}>{error}</Typography>
        ) : (
          <Box component="form" onSubmit={handleSaveClick}>
            {/* Show children information for parents */}
            {form.userType && form.userType.toLowerCase() === 'parent' && (
              <ParentChildren parentUserId={userId} />
            )}
            
            {metaRow}
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                <Input label="First Name" value={form.firstName} onChange={handleChange('firstName')} required />
              </Grid>
              <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                <Input label="Last Name" value={form.lastName} onChange={handleChange('lastName')} required />
              </Grid>
              <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} required />
              </Grid>
              <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                <Input label="Phone" value={form.phone} onChange={handleChange('phone')} />
              </Grid>
              <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                <SelectInput
                  label="User Type"
                  value={form.userType}
                  onChange={handleChange('userType')}
                  options={userTypeOptions}
                />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%' }}>
                <Input label="Address" value={form.address} onChange={handleChange('address')} multiline minRows={2} />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={handleReset} disabled={saving}>
                Reset
              </Button>
              <Button variant="contained" type="submit" onClick={handleSaveClick} disabled={!canSave || saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </Box>
        )}
      </CardContent>
      <ToastComponent open={open} message={message} severity={severity} onClose={closeToast} />
      <Popup
        open={showPopup}
        title="Are Sure you want to Update the Account?"
        description="Selecting 'Save' will update your account information with the changes you've made and cannot be undone"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        confirmText="Save"
        cancelText="Cancel"
      />
    </Card>
  );
};

export default MyAccountInformation;
