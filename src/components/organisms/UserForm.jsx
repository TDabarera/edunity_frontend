import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { Input, SelectInput, Button } from '../atoms';
import colors from '../../styles/colors';
import { CreateUser, UpdateUser } from '../../services';
import { useToast } from './Toast';

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
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  useEffect(() => {
    if (isEdit && user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '', // hidden in edit mode
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

  const canSubmit = useMemo(() => {
    const required = ['firstName', 'lastName', 'email', 'userType'];
    if (!isEdit) required.push('password');
    return required.every((k) => (form[k] || '').toString().trim().length > 0);
  }, [form, isEdit]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      if (isEdit) {
        const payload = { ...form };
        // Ensure password is not sent in update
        delete payload.password;
        const res = await UpdateUser(user._id, payload);
        const successMsg = res?.message || 'User updated successfully';
        showToast(successMsg, 'success');
        if (onSuccess) onSuccess(res?.user || payload);
      } else {
        const createPayload = { ...form };
        const res = await CreateUser(createPayload);
        const successMsg = res?.message || 'User created successfully!';
        showToast(successMsg, 'success');
        if (onSuccess) onSuccess(res?.user || createPayload);
      }
    } catch (err) {
      const errorMsg = err?.data?.error || err?.message || 'Operation failed';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Name Group */}
        <Grid item xs={12} md={6}>
          <Input label="First Name" value={form.firstName} onChange={handleChange('firstName')} required />
        </Grid>
        <Grid item xs={12} md={6}>
          <Input label="Last Name" value={form.lastName} onChange={handleChange('lastName')} required />
        </Grid>

        {/* Contact Group */}
        <Grid item xs={12} md={6}>
          <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} required />
        </Grid>
        <Grid item xs={12} md={6}>
          <Input label="Phone" type="tel" value={form.phone} onChange={handleChange('phone')} />
        </Grid>
        <Grid item xs={12}>
          <Input label="Address" value={form.address} onChange={handleChange('address')} multiline minRows={3} />
        </Grid>

        {/* Role / Details */}
        <Grid item xs={12} md={6}>
          <SelectInput label="User Type" value={form.userType} onChange={handleChange('userType')} options={userTypeOptions} required />
        </Grid>
        <Grid item xs={12} md={6}>
          <Input label="Date of Birth" type="date" value={form.dob} onChange={handleChange('dob')} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Input label="Class ID" value={form.classId} onChange={handleChange('classId')} />
        </Grid>

        {/* Security (Create Mode Only) */}
        {!isEdit && (
          <Grid item xs={12} md={6}>
            <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} required />
          </Grid>
        )}

        {/* Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || submitting}>
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Toast */}
      <ToastComponent open={open} message={message} severity={severity} onClose={closeToast} />
    </Box>
  );
};

export default UserForm;
