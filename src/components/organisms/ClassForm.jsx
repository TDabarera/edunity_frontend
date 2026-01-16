import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { Input, SelectInput, Button } from '../atoms';
import colors from '../../styles/colors';
import { CreateClass, UpdateClass, GetAllClasses } from '../../services';
import { useToast } from './Toast';

const yearOptions = [
  { label: '2024', value: '2024' },
  { label: '2025', value: '2025' },
  { label: '2026', value: '2026' },
  { label: '2027', value: '2027' },
];

const initialForm = {
  className: '',
  year: '',
  teacherIncharge: '',
};

const ClassForm = ({ classData = null, onSuccess, onCancel, teachers = [] }) => {
  const isEdit = !!classData;
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  useEffect(() => {
    if (isEdit && classData) {
      setForm({
        className: classData.className || '',
        year: classData.year || '',
        teacherIncharge: classData.teacherIncharge?._id || classData.teacherIncharge || '',
      });
    } else {
      setForm(initialForm);
    }
  }, [isEdit, classData]);

  const canSubmit = useMemo(() => {
    const required = ['className', 'year', 'teacherIncharge'];
    return required.every((k) => (form[k] || '').toString().trim().length > 0);
  }, [form]);

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
      const payload = {
        className: form.className,
        year: form.year,
        teacherIncharge: form.teacherIncharge,
      };

      if (isEdit) {
        const res = await UpdateClass(classData._id, payload);
        const successMsg = res?.message || 'Class updated successfully';
        showToast(successMsg, 'success');
        if (onSuccess) onSuccess(res?.data || payload);
      } else {
        const res = await CreateClass(payload);
        const successMsg = res?.message || 'Class created successfully!';
        showToast(successMsg, 'success');
        if (onSuccess) onSuccess(res?.data || payload);
      }
    } catch (err) {
      const errorMsg = err?.data?.error || err?.message || 'Operation failed';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const teacherOptions = teachers.map((t) => ({
    label: `${t.firstName} ${t.lastName}`,
    value: t._id,
  }));

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Input
            label="Class Name"
            value={form.className}
            onChange={handleChange('className')}
            placeholder="e.g., Class 10A"
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectInput
            label="Year"
            value={form.year}
            onChange={handleChange('year')}
            options={yearOptions}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <SelectInput
            label="Teacher in Charge"
            value={form.teacherIncharge}
            onChange={handleChange('teacherIncharge')}
            options={teacherOptions}
            required
          />
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || submitting}>
              {isEdit ? 'Update Class' : 'Create Class'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Toast */}
      <ToastComponent open={open} message={message} severity={severity} onClose={closeToast} />
    </Box>
  );
};

export default ClassForm;
