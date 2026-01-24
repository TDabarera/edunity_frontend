import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Grid, Divider, Typography } from '@mui/material';
import { Input, SelectInput, Button } from '../atoms';
import colors from '../../styles/colors';
import { CreateClass, UpdateClass } from '../../services';
import { useToast } from './useToast.jsx';
import Popup from './Popup';

const yearOptions = [];

const levelOptions = [
  { label: 'Level 1', value: 1 },
  { label: 'Level 2', value: 2 },
  { label: 'Level 3', value: 3 },
  { label: 'Level 4', value: 4 },
  { label: 'Level 5', value: 5 },
  { label: 'Level 6', value: 6 },
  { label: 'Level 7', value: 7 },
  { label: 'Level 8', value: 8 },
  { label: 'Level 9', value: 9 },
  { label: 'Level 10', value: 10 },
  { label: 'Level 11', value: 11 },
  { label: 'Level 12', value: 12 },
  { label: 'Level 13', value: 13 },
];

const orderOptions = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
  { label: 'D', value: 'D' },
];

const initialForm = {
  level: '',
  order: '',
  year: '',
  teacherIncharge: '',
};

const ClassForm = ({ classData = null, onSuccess, onCancel, teachers = [] }) => {
  const isEdit = !!classData;
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  console.log('[ClassForm] Rendered, isEdit:', isEdit, 'classData:', classData?._id, 'teachers:', teachers.length);

  useEffect(() => {
    if (isEdit && classData) {
      console.log('[ClassForm] Setting form from classData:', classData);
      setForm({
        level: classData.level || '',
        order: classData.order || '',
        year: classData.year || '',
        teacherIncharge: classData.teacherIncharge?._id || classData.teacherIncharge || '',
      });
    } else {
      setForm(initialForm);
    }
  }, [isEdit, classData]);

  const canSubmit = useMemo(() => {
    const required = ['level', 'order', 'year', 'teacherIncharge'];
    return required.every((k) => (form[k] || '').toString().trim().length > 0);
  }, [form]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    console.log('[ClassForm] handleSaveClick, canSubmit:', canSubmit, 'form:', form);
    if (!canSubmit) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }
    console.log('[ClassForm] Opening confirmation popup');
    setShowPopup(true);
  };

  const handleConfirmSave = async () => {
    console.log('[ClassForm] handleConfirmSave started');
    setShowPopup(false);

    if (!canSubmit) {
      console.log('[ClassForm] handleConfirmSave: canSubmit is false, returning');
      return;
    }

    console.log('Submitting form:', form);

    try {
      setSubmitting(true);
      const basePayload = {
        level: Number(form.level),
        order: form.order,
        year: Number(form.year),
        teacherIncharge: form.teacherIncharge,
      };

      if (isEdit) {
        console.log('Update payload:', basePayload);
        const res = await UpdateClass(classData._id, basePayload);
        console.log('Update response:', res);
        const successMsg = res?.message || 'Class updated successfully';
        showToast(successMsg, 'success');
        if (onSuccess) onSuccess(res?.data || basePayload);
      } else {
        console.log('Create payload:', basePayload);
        const res = await CreateClass(basePayload);
        console.log('Create response:', res);
        const successMsg = res?.message || 'Class created successfully!';
        showToast(successMsg, 'success');
        if (onSuccess) onSuccess(res?.data || basePayload);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      const errorMsg = err?.data?.error || err?.message || 'Operation failed';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSave = () => {
    setShowPopup(false);
  };

  const handleReset = () => {
    if (isEdit && classData) {
      setForm({
        level: classData.level || '',
        order: classData.order || '',
        year: classData.year || '',
        teacherIncharge: classData.teacherIncharge?._id || classData.teacherIncharge || '',
      });
    } else {
      setForm(initialForm);
    }
  };

  const teacherOptions = teachers.map((t) => ({
    label: `${t.firstName} ${t.lastName}`,
    value: t._id,
  }));

  console.log('Teacher options:', teacherOptions);
  console.log('Can submit:', canSubmit);

  // Generate className preview
  const classNamePreview = useMemo(() => {
    if (form.level && form.order && form.year) {
      return `Grade ${form.level}${form.order} ${form.year}`;
    }
    return '';
  }, [form.level, form.order, form.year]);

  // Reusable computed class name for payload; fallback to existing class name in edit mode
  const computedClassName = classNamePreview || (isEdit ? classData?.className : '');

  return (
    <Card elevation={0} sx={{ p: 4, m: 0, boxShadow: 'none', borderRadius: 0 }}>
      <CardHeader
        title={isEdit ? 'Edit Class' : 'Create Class'}
        subheader={isEdit ? 'Update class information' : 'Add a new class to the system'}
        sx={{ backgroundColor: 'white' }}
      />
      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSaveClick}>
          <Divider sx={{ mb: 3 }} />
          
          {/* Class Name Preview (Read-only) */}
          {(classNamePreview || (isEdit && classData?.className)) && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: colors.primary.greyLight, borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Class Name (Auto-generated)
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {isEdit ? classData.className : classNamePreview}
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <SelectInput
                label="Level"
                value={form.level}
                onChange={handleChange('level')}
                options={levelOptions}
                required
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <SelectInput
                label="Order"
                value={form.order}
                onChange={handleChange('order')}
                options={orderOptions}
                required
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <Input
                label="Year"
                type="number"
                value={form.year}
                onChange={handleChange('year')}
                placeholder="e.g., 2025"
                required
              />
            </Grid>
            <Grid item xs={12} sx={{ width: '100%' }}>
              <SelectInput
                label="Teacher in Charge"
                value={form.teacherIncharge}
                onChange={handleChange('teacherIncharge')}
                options={teacherOptions}
                required
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={handleReset} disabled={submitting}>
              Reset
            </Button>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
            )}
            <Button variant="contained" type="submit" onClick={handleSaveClick} disabled={!canSubmit || submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Class' : 'Create Class'}
            </Button>
          </Box>
        </Box>
      </CardContent>

      <ToastComponent open={open} message={message} severity={severity} onClose={closeToast} />
      <Popup
        open={showPopup}
        title={isEdit ? 'Update Class' : 'Create Class'}
        description={
          isEdit
            ? 'Are you sure you want to update this class information?'
            : 'Are you sure you want to create this new class?'
        }
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        confirmText={isEdit ? 'Update' : 'Create'}
        cancelText="Cancel"
      />
    </Card>
  );
};

export { ClassForm };
export default ClassForm;
