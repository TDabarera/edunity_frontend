import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { CloudUploadOutlined as CloudUploadOutlinedIcon } from '@mui/icons-material';
import { Button } from '../atoms';
import { GetMyAssignments, SubmitAssignment, EditSubmission } from '../../services';
import { useToast } from './useToast';
import Popup from './Popup';
import colors from '../../styles/colors';

const MAX_PDF_SIZE_BYTES = 16 * 1024 * 1024;

const SubmitorEditAssignment = ({ mode = 'submit', assignmentId = '', onSuccess, onCancel }) => {
  const isEdit = mode === 'edit';
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const { showToast, Toast: ToastComponent } = useToast();

  const assignmentOptions = useMemo(() => {
    const filteredAssignments = assignments.filter((item) => {
      if (isEdit) {
        return !!item.isSubmitted;
      }
      return !item.isSubmitted;
    });

    return filteredAssignments.map((item) => ({
      id: item._id,
      title: item?.title ? String(item.title).replace(/"/g, '') : 'Untitled Assignment',
      deadline: item.deadline,
      isSubmitted: item.isSubmitted,
    }));
  }, [assignments, isEdit]);

  const selectedAssignmentOption = useMemo(() => {
    return assignmentOptions.find((option) => option.id === selectedAssignmentId) || null;
  }, [assignmentOptions, selectedAssignmentId]);

  const canSubmit = useMemo(() => {
    return Boolean(selectedAssignmentId && selectedFile);
  }, [selectedAssignmentId, selectedFile]);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoadingAssignments(true);
      const response = await GetMyAssignments();
      setAssignments(response?.assignments || []);
    } catch (error) {
      showToast(error?.message || 'Failed to load assignments', 'error');
    } finally {
      setLoadingAssignments(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    if (!assignmentId) {
      return;
    }

    setSelectedAssignmentId(String(assignmentId));
  }, [assignmentId]);

  useEffect(() => {
    if (selectedAssignmentId) {
      return;
    }

    if (assignmentOptions.length === 1) {
      setSelectedAssignmentId(assignmentOptions[0].id);
    }
  }, [assignmentOptions, selectedAssignmentId]);

  const handleAssignmentChange = (_, value) => {
    setSelectedAssignmentId(value?.id || '');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are allowed.', 'warning');
      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      showToast('PDF size must be 16MB or less.', 'warning');
      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const executeSubmit = async () => {
    if (!canSubmit) {
      showToast('Please select an assignment and PDF file.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      let response;

      if (isEdit) {
        response = await EditSubmission(selectedAssignmentId, selectedFile);
      } else {
        response = await SubmitAssignment(selectedAssignmentId, selectedFile);
      }

      showToast(response?.message || (isEdit ? 'Submission updated successfully!' : 'Assignment submitted successfully!'), 'success');

      if (onSuccess) {
        onSuccess(response);
      }

      setSelectedFile(null);
      if (!isEdit) {
        await fetchAssignments();
      }
    } catch (error) {
      showToast(error?.message || (isEdit ? 'Failed to update submission' : 'Failed to submit assignment'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPopup = (actionType) => {
    if (actionType === 'submit' && !canSubmit) {
      showToast('Please select an assignment and PDF file.', 'warning');
      return;
    }

    setPendingAction(actionType);
    setPopupOpen(true);
  };

  const handlePopupCancel = () => {
    setPopupOpen(false);
    setPendingAction(null);
  };

  const handlePopupConfirm = async () => {
    const actionType = pendingAction;
    setPopupOpen(false);
    setPendingAction(null);

    if (actionType === 'cancel') {
      if (onCancel) {
        onCancel();
      }
      return;
    }

    if (actionType === 'submit') {
      await executeSubmit();
    }
  };

  const isSelectedAssignmentMissing = selectedAssignmentId && !selectedAssignmentOption;

  return (
    <Card elevation={0} sx={{ p: 4, m: 0, boxShadow: 'none', borderRadius: 0 }}>
      <CardHeader
        title={isEdit ? 'Edit Submission' : 'Submit Assignment'}
        subheader={
          isEdit
            ? 'Select a submitted assignment and upload a new PDF to edit your submission.'
            : 'Select an unsubmitted assignment and upload your PDF submission.'
        }
        sx={{ backgroundColor: 'white' }}
      />

      <CardContent sx={{ p: 3 }}>
        <Box>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 2 }}>
            <Autocomplete
              options={assignmentOptions}
              value={selectedAssignmentOption}
              onChange={handleAssignmentChange}
              loading={loadingAssignments}
              getOptionLabel={(option) => option?.title || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={isEdit ? 'No submitted assignments available' : 'No unsubmitted assignments available'}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                      Assignment ID: {option.id}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={isEdit ? 'Select Submitted Assignment' : 'Select Due Unsubmitted Assignment'}
                  margin="normal"
                  placeholder="Search assignment"
                  helperText={
                    isEdit
                      ? 'Choose one submitted assignment for editing.'
                      : 'Choose one due unsubmitted assignment to submit.'
                  }
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingAssignments ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            {isSelectedAssignmentMissing && (
              <Typography variant="caption" sx={{ color: colors.warning.main, fontWeight: 500 }}>
                Selected assignment is not available in this list.
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{
                color: colors.text.primary,
                fontWeight: 600,
              }}
            >
              Selected Assignment ID: {selectedAssignmentId || 'Select an assignment'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box
              component="label"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 180,
                px: 3,
                py: 4,
                borderRadius: 3,
                border: `2px dashed ${colors.primary.grey}`,
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: colors.text.secondary,
                },
              }}
            >
              <input
                hidden
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: colors.text.secondary, mb: 1.5 }} />
              <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 600, mb: 1 }}>
                {isEdit ? 'Upload New PDF For Submission Edit' : 'Upload Submission PDF'}
              </Typography>
              <Typography
                sx={{
                  color: colors.text.secondary,
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              >
                Only PDF files are accepted, maximum size is 16MB.
              </Typography>
            </Box>

            {selectedFile && (
              <Typography
                sx={{ display: 'block', color: colors.text.primary, mt: 1.5, fontWeight: 500 }}
              >
                Selected file: {selectedFile.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            {onCancel && (
              <Button variant="outlined" onClick={() => handleOpenPopup('cancel')} disabled={submitting}>
                Cancel
              </Button>
            )}
            <Button variant="contained" onClick={() => handleOpenPopup('submit')} disabled={!canSubmit || submitting}>
              {submitting ? (isEdit ? 'Updating...' : 'Submitting...') : isEdit ? 'Update Submission' : 'Submit Assignment'}
            </Button>
          </Box>
        </Box>
      </CardContent>

      <Popup
        open={popupOpen}
        title="Confirm Action"
        description="Are you sure you want to continue with this submission action?"
        onConfirm={handlePopupConfirm}
        onCancel={handlePopupCancel}
        confirmText="Yes"
        cancelText="No"
      />

      <ToastComponent />
    </Card>
  );
};

export default SubmitorEditAssignment;
