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
import { Button, Input } from '../atoms';
import { GetAllClasses, CreateAssignment, UpdateAssignment } from '../../services';
import { useToast } from './useToast';
import Popup from './Popup';
import colors from '../../styles/colors';

const MAX_PDF_SIZE_BYTES = 16 * 1024 * 1024;

const initialFormState = {
  title: '',
  deadlineDate: '',
  deadlineTime: '',
  assignedToClasses: [],
};

const padTwo = (value) => value.toString().padStart(2, '0');

const toDateInputValue = (isoDate) => {
  if (!isoDate) return '';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '';

  const year = parsed.getUTCFullYear();
  const month = padTwo(parsed.getUTCMonth() + 1);
  const day = padTwo(parsed.getUTCDate());
  return `${year}-${month}-${day}`;
};

const toTimeInputValue = (isoDate) => {
  if (!isoDate) return '';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '';

  const hours = padTwo(parsed.getUTCHours());
  const minutes = padTwo(parsed.getUTCMinutes());
  return `${hours}:${minutes}`;
};

const toDeadlineISO = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return '';

  const [year, month, day] = dateValue.split('-').map(Number);
  const [hours, minutes] = timeValue.split(':').map(Number);

  if ([year, month, day, hours, minutes].some((part) => Number.isNaN(part))) {
    return '';
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 59));
  return utcDate.toISOString().replace('.000Z', 'Z');
};

const normalizeClassName = (classItem) => {
  if (!classItem) return '';

  if (typeof classItem === 'string') {
    return classItem.trim();
  }

  if (classItem.className) {
    return String(classItem.className).trim();
  }

  if (classItem.name) {
    return String(classItem.name).trim();
  }

  const level = classItem.level ? `Grade ${classItem.level}` : '';
  const order = classItem.order || '';
  const year = classItem.year ? ` ${classItem.year}` : '';
  return `${level}${order}${year}`.trim();
};

const toClassOption = (classItem) => {
  if (!classItem) return null;

  if (typeof classItem === 'string') {
    const value = classItem.trim();
    if (!value) return null;
    return { id: value, name: value };
  }

  const id = classItem._id || classItem.id || classItem.value;
  const name = normalizeClassName(classItem);

  if (!id || !name) return null;
  return { id: String(id), name };
};

const dedupeClassOptions = (values = []) => {
  const mapped = values
    .map((item) => toClassOption(item))
    .filter(Boolean);

  const optionMap = new Map();
  mapped.forEach((option) => {
    if (!optionMap.has(option.id)) {
      optionMap.set(option.id, option);
    }
  });

  return Array.from(optionMap.values());
};

const looksLikeClassId = (value) => {
  if (!value) return false;
  const normalized = String(value).trim();
  return /^[a-f0-9]{24}$/i.test(normalized) || /^class[-_]/i.test(normalized);
};

const resolveAssignedClassIds = (assignedValues = [], options = []) => {
  const optionById = new Map(options.map((option) => [option.id, option]));
  const optionByName = new Map(options.map((option) => [option.name.toLowerCase(), option]));

  const resolved = assignedValues
    .map((value) => {
      if (!value) return '';

      if (typeof value === 'object') {
        return String(value._id || value.id || '').trim();
      }

      const normalizedValue = String(value).trim();
      if (!normalizedValue) return '';

      if (optionById.has(normalizedValue)) {
        return optionById.get(normalizedValue).id;
      }

      const optionMatch = optionByName.get(normalizedValue.toLowerCase());
      if (optionMatch) {
        return optionMatch.id;
      }

      return looksLikeClassId(normalizedValue) ? normalizedValue : '';
    })
    .filter(Boolean);

  return Array.from(new Set(resolved));
};

const UploadOrEditAssignment = ({ mode = 'upload', assignmentData = null, onSuccess, onCancel }) => {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(initialFormState);
  const [classOptions, setClassOptions] = useState([]);
  const [classLoading, setClassLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const { showToast, Toast: ToastComponent } = useToast();

  const selectedClassOptions = useMemo(() => {
    const optionById = new Map(classOptions.map((option) => [option.id, option]));

    return form.assignedToClasses
      .map((classId) => optionById.get(classId) || { id: classId, name: classId })
      .filter(Boolean);
  }, [classOptions, form.assignedToClasses]);

  const selectedClassNames = useMemo(() => {
    return selectedClassOptions.map((option) => option.name);
  }, [selectedClassOptions]);

  const deadlineISO = useMemo(() => {
    return toDeadlineISO(form.deadlineDate, form.deadlineTime);
  }, [form.deadlineDate, form.deadlineTime]);

  const canSubmit = useMemo(() => {
    const hasRequiredFields =
      form.title.trim().length > 0 &&
      form.deadlineDate.trim().length > 0 &&
      form.deadlineTime.trim().length > 0 &&
      form.assignedToClasses.length > 0 &&
      deadlineISO;

    if (!hasRequiredFields) {
      return false;
    }

    if (!isEdit) {
      return !!selectedFile;
    }

    return true;
  }, [deadlineISO, form.assignedToClasses.length, form.deadlineDate, form.deadlineTime, form.title, isEdit, selectedFile]);

  const fetchClassOptions = useCallback(async () => {
    try {
      setClassLoading(true);
      const response = await GetAllClasses();
      const classList = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.classes)
          ? response.classes
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : Array.isArray(response?.data?.classes)
              ? response.data.classes
              : [];
      const normalizedOptions = dedupeClassOptions(classList);
      setClassOptions(normalizedOptions);
    } catch (error) {
      showToast(error?.message || 'Failed to load classes', 'error');
    } finally {
      setClassLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchClassOptions();
  }, [fetchClassOptions]);

  useEffect(() => {
    if (!isEdit) {
      setForm(initialFormState);
      setSelectedFile(null);
    }
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit || !assignmentData) {
      return;
    }

    setForm({
      title: assignmentData.title ? String(assignmentData.title).replace(/"/g, '') : '',
      deadlineDate: toDateInputValue(assignmentData.deadline),
      deadlineTime: toTimeInputValue(assignmentData.deadline),
      assignedToClasses: resolveAssignedClassIds(assignmentData.assignedToClasses || [], classOptions),
    });
    setSelectedFile(null);
  }, [assignmentData, classOptions, isEdit]);

  const handleFieldChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleClassesChange = (_, values) => {
    const selectedIds = values
      .map((value) => value?.id)
      .filter(Boolean);

    setForm((prev) => ({
      ...prev,
      assignedToClasses: Array.from(new Set(selectedIds)),
    }));
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
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    const payload = {
      title: form.title.trim(),
      deadline: deadlineISO,
      assignedToClasses: form.assignedToClasses,
    };

    try {
      setSubmitting(true);

      let response;
      if (isEdit) {
        response = await UpdateAssignment(assignmentData?._id, payload, selectedFile);
      } else {
        response = await CreateAssignment(payload, selectedFile);
      }

      showToast(response?.message || (isEdit ? 'Assignment updated successfully!' : 'Assignment uploaded successfully!'), 'success');

      if (onSuccess) {
        onSuccess(response);
      }

      if (!isEdit) {
        setForm(initialFormState);
        setSelectedFile(null);
      }
    } catch (error) {
      showToast(error?.message || (isEdit ? 'Failed to update assignment' : 'Failed to upload assignment'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPopup = (actionType) => {
    if (actionType === 'submit' && !canSubmit) {
      showToast('Please fill all required fields.', 'warning');
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

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleOpenPopup('submit');
  };

  return (
    <Card elevation={0} sx={{ p: 4, m: 0, boxShadow: 'none', borderRadius: 0 }}>
      <CardHeader
        title={isEdit ? 'Edit Assignment' : 'Upload Assignment'}
        subheader={
          isEdit
            ? 'Update assignment details. Upload another file if you want to update the assignment file.'
            : 'Create and upload a new assignment'
        }
        sx={{ backgroundColor: 'white' }}
      />

      <CardContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleFormSubmit}>
          <Divider sx={{ mb: 3 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Input
                label="Assignment Name"
                value={form.title}
                onChange={handleFieldChange('title')}
                required
              />
            </Box>

            <Box>
              <Input
                label="Deadline Date"
                type="date"
                value={form.deadlineDate}
                onChange={handleFieldChange('deadlineDate')}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>

            <Box>
              <Input
                label="Deadline Time"
                type="time"
                value={form.deadlineTime}
                onChange={handleFieldChange('deadlineTime')}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
                required
              />
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{
                color: colors.text.primary,
                fontWeight: 600,
              }}
            >
              Confirm Deadline: {deadlineISO || 'Select date and time'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Autocomplete
              multiple
              options={classOptions}
              value={selectedClassOptions}
              onChange={handleClassesChange}
              loading={classLoading}
              filterSelectedOptions
              getOptionLabel={(option) => option?.name || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign to Classes"
                  margin="normal"
                  placeholder="Type to search classes"
                  helperText="Type to search and select one or more classes."
                  required={form.assignedToClasses.length === 0}
                  FormHelperTextProps={{
                    sx: {
                      color: colors.text.secondary,
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      mt: 1,
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {classLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{
                color: colors.text.primary,
                fontWeight: 600,
              }}
            >
              Classes Selected: {JSON.stringify(selectedClassNames)}
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
                {isEdit ? 'Upload Another File If You Want To Update The Assignment' : 'Upload PDF File'}
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

            {isEdit && assignmentData?.file && (
              <Typography
                sx={{ display: 'block', color: colors.text.secondary, mt: 1.5, fontWeight: 500 }}
              >
                Current file: {assignmentData.file}
              </Typography>
            )}

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
            <Button variant="contained" type="submit" disabled={!canSubmit || submitting}>
              {submitting ? (isEdit ? 'Updating...' : 'Uploading...') : isEdit ? 'Update Assignment' : 'Upload Assignment'}
            </Button>
          </Box>
        </Box>
      </CardContent>

      <Popup
        open={popupOpen}
        title="Confirm Action"
        description="Are you sure you want to continue with this assignment action?"
        onConfirm={handlePopupConfirm}
        onCancel={handlePopupCancel}
        confirmText="Yes"
        cancelText="No"
      />

      <ToastComponent />
    </Card>
  );
};

export default UploadOrEditAssignment;
