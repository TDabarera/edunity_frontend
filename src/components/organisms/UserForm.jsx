import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Divider, Grid } from '@mui/material';
import { Input, SelectInput, Button } from '../atoms';
import { CreateUser, UpdateUser, GetAllClasses } from '../../services';
import { useToast } from './Toast';
import Popup from './Popup';

const userTypeOptions = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Student', value: 'Student' },
  { label: 'Parent', value: 'Parent' },
  { label: 'Teacher', value: 'Teacher' },
];

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: '',
  userType: '',
  dob: '',
  classId: '',
};

const UserForm = ({ user = null, onSuccess, onCancel }) => {
  const isEdit = !!user;
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  useEffect(() => {
    if (isEdit && user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '', // hidden in edit mode
        confirmPassword: '',
        phone: user.phone || '',
        address: user.address || '',
        userType: user.userType || '',
        dob: user.dob ? String(user.dob).slice(0, 10) : '', // yyyy-mm-dd
        classId: user.classId || '',
      });
    } else {
      setForm(initialForm);
    }
  }, [isEdit, user]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await GetAllClasses();
        const list = res?.data || res?.classes || [];
        setClasses(list);
      } catch (err) {
        const errorMsg = err?.data?.error || err?.message || 'Failed to fetch classes';
        showToast(errorMsg, 'error');
      }
    };

    fetchClasses();
  }, [showToast]);

  const canSubmit = useMemo(() => {
    const required = ['firstName', 'lastName', 'email', 'userType'];
    if (!isEdit) required.push('password', 'confirmPassword');
    return required.every((k) => (form[k] || '').toString().trim().length > 0);
  }, [form, isEdit]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }
    if (!isEdit && form.password !== form.confirmPassword) {
      showToast('Passwords do not match.', 'warning');
      return;
    }
    setShowPopup(true);
  };

  const handleConfirmSave = async () => {
    setShowPopup(false);

    if (!canSubmit) return;

    try {
      setSubmitting(true);
      if (isEdit) {
        const payload = { ...form };
        delete payload.password;
        delete payload.confirmPassword;
        console.log('[UserForm] Update payload:', payload);
        const res = await UpdateUser(user._id, payload);
        console.log('[UserForm] Update response:', res);
        const successMsg = res?.message || 'User updated successfully';
        showToast(successMsg, 'success');
        if (onSuccess) onSuccess(res?.user || payload);
      } else {
        const createPayload = { ...form };
        delete createPayload.confirmPassword;
        console.log('[UserForm] Create payload:', createPayload);
        const res = await CreateUser(createPayload);
        console.log('[UserForm] Create response:', res);
        const successMsg = res?.message || 'User created successfully!';
        showToast(successMsg, 'success');
        if (onSuccess) onSuccess(res?.user || createPayload);
      }
    } catch (err) {
      const errorMsg = err?.data?.error || err?.message || 'Operation failed';
      showToast(errorMsg, 'error');
      console.error('[UserForm] Operation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSave = () => {
    setShowPopup(false);
  };

  const handleReset = () => {
    if (isEdit && user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        phone: user.phone || '',
        address: user.address || '',
        userType: user.userType || '',
        dob: user.dob ? String(user.dob).slice(0, 10) : '',
        classId: user.classId || '',
      });
    } else {
      setForm(initialForm);
    }
  };

  return (
    <Card elevation={0} sx={{ p: 4, m: 0, boxShadow: 'none', borderRadius: 0 }}>
      <CardHeader
        title={isEdit ? 'Edit User' : 'Create User'}
        subheader={isEdit ? 'Update user information' : 'Add a new user to the system'}
        sx={{ backgroundColor: 'white' }}
      />
      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSaveClick}>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {/* Name Group */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Input label="First Name" value={form.firstName} onChange={handleChange('firstName')} required />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Input label="Last Name" value={form.lastName} onChange={handleChange('lastName')} required />
            </Grid>

            {/* Contact Group */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} required />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Input label="Phone" type="tel" value={form.phone} onChange={handleChange('phone')} />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Input label="Address" value={form.address} onChange={handleChange('address')} multiline minRows={3} />
            </Grid>

            {/* Role / Details */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <SelectInput label="User Type" value={form.userType} onChange={handleChange('userType')} options={userTypeOptions} required />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
        <Input
          label="Date of Birth"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange('dob')}
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: new Date().toISOString().slice(0, 10) }}
          fullWidth
        />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <SelectInput
                label="Class Name"
                value={form.classId}
                onChange={handleChange('classId')}
                options={(classes || []).map((cls) => ({
                  label: cls.className || `${cls.level || ''}${cls.order || ''} ${cls.year || ''}`.trim(),
                  value: cls._id,
                }))}
                placeholder={classes.length ? 'Select class' : 'No classes available'}
              />
            </Grid>

            {/* Security (Create Mode Only) */}
            {!isEdit && (
              <Grid item xs={12} sx={{ width: '100%' }}>
                <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} required />
              </Grid>
            )}
            {!isEdit && (
              <Grid item xs={12} sx={{ width: '100%' }}>
                <Input
                  label="Confirm Password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  required
                />
              </Grid>
            )}

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                <Button variant="outlined" onClick={handleReset} disabled={submitting}>
                  Reset
                </Button>
                {onCancel && (
                  <Button variant="outlined" onClick={onCancel} disabled={submitting}>
                    Cancel
                  </Button>
                )}
                <Button variant="contained" type="submit" onClick={handleSaveClick} disabled={!canSubmit || submitting}>
                  {submitting ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>

      <ToastComponent open={open} message={message} severity={severity} onClose={closeToast} />
      <Popup
        open={showPopup}
        title={isEdit ? 'Update User' : 'Create User'}
        description={
          isEdit
            ? 'Are you sure you want to update this user information?'
            : 'Are you sure you want to create this new user?'
        }
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        confirmText={isEdit ? 'Update' : 'Create'}
        cancelText="Cancel"
      />
    </Card>
  );
};

export default UserForm;
