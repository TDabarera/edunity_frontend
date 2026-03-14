import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Grid, Alert } from '@mui/material';
import { Button } from '../atoms';
import { AssignmentCard } from '../molecules';
import { GetAllAssignments, DeleteAssignment, GetAllClasses } from '../../services';
import { useToast } from './useToast';
import Popup from './Popup';
import UploadOrEditAssignment from './UploadOrEditAssignment';
import colors from '../../styles/colors';

const getClassName = (classItem) => {
  if (!classItem) return '';

  if (classItem.className) return String(classItem.className).trim();
  if (classItem.name) return String(classItem.name).trim();

  const level = classItem.level ? `Grade ${classItem.level}` : '';
  const order = classItem.order || '';
  const year = classItem.year ? ` ${classItem.year}` : '';
  return `${level}${order}${year}`.trim();
};

const buildClassLookup = (classList = []) => {
  return classList.reduce((lookup, classItem) => {
    const classId = classItem?._id || classItem?.id || classItem?.value;
    const className = getClassName(classItem);

    if (classId && className) {
      lookup[String(classId)] = className;
    }

    return lookup;
  }, {});
};

const MyAssignments = ({ onEdit }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classNameLookup, setClassNameLookup] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploadAssignmentOpen, setUploadAssignmentOpen] = useState(false);
  const [editAssignmentOpen, setEditAssignmentOpen] = useState(false);
  const [editAssignmentData, setEditAssignmentData] = useState(null);
  const { showToast, Toast: ToastComponent } = useToast();

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, classesResponse] = await Promise.all([GetAllAssignments(), GetAllClasses()]);

      const classList = Array.isArray(classesResponse?.data)
        ? classesResponse.data
        : Array.isArray(classesResponse?.classes)
          ? classesResponse.classes
          : Array.isArray(classesResponse?.data?.data)
            ? classesResponse.data.data
            : Array.isArray(classesResponse?.data?.classes)
              ? classesResponse.data.classes
              : [];

      setClassNameLookup(buildClassLookup(classList));
      setAssignments(data.assignments || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch assignments';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleEdit = (assignment) => {
    if (onEdit) {
      onEdit(assignment);
      return;
    }

    setUploadAssignmentOpen(false);
    setEditAssignmentData(assignment);
    setEditAssignmentOpen(true);
  };

  const handleUploadClick = () => {
    setEditAssignmentOpen(false);
    setEditAssignmentData(null);
    setUploadAssignmentOpen(true);
  };

  const handleDeleteClick = (assignment) => {
    setSelectedAssignment(assignment);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAssignment) return;

    try {
      await DeleteAssignment(selectedAssignment._id);
      setAssignments((prev) => prev.filter((item) => item._id !== selectedAssignment._id));
      showToast('Assignment deleted successfully!', 'success');
      setDeleteConfirmOpen(false);
      setSelectedAssignment(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete assignment';
      showToast(errorMessage, 'error');
      console.error('Error deleting assignment:', err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedAssignment(null);
  };

  const handleFormSuccess = async (response) => {
    showToast(response?.message || 'Assignment saved successfully!', 'success');
    setUploadAssignmentOpen(false);
    setEditAssignmentOpen(false);
    setEditAssignmentData(null);
    await fetchAssignments();
  };

  const handleFormCancel = () => {
    setUploadAssignmentOpen(false);
    setEditAssignmentOpen(false);
    setEditAssignmentData(null);
  };

  const showAssignmentForm = uploadAssignmentOpen || editAssignmentOpen;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <CircularProgress sx={{ color: colors.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {showAssignmentForm ? (
        <UploadOrEditAssignment
          mode={uploadAssignmentOpen ? 'upload' : 'edit'}
          assignmentData={uploadAssignmentOpen ? null : editAssignmentData}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: colors.primary.dark,
                mb: 0,
              }}
            >
              My Assignments
            </Typography>
            <Button variant="contained" onClick={handleUploadClick}>
              Upload Assignment
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {assignments.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 5,
                backgroundColor: colors.primary.greyLight,
                borderRadius: 2,
                border: `1px solid ${colors.primary.grey}`,
              }}
            >
              <Typography variant="body1" sx={{ color: colors.text.secondary }}>
                No assignments found.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {assignments.map((assignment) => (
                <Grid item xs={12} sm={6} md={4} key={assignment._id}>
                  <AssignmentCard
                    assignment={assignment}
                    classNameLookup={classNameLookup}
                    showActions={true}
                    onEdit={() => handleEdit(assignment)}
                    onDelete={() => handleDeleteClick(assignment)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Popup
        open={deleteConfirmOpen}
        title="Delete Assignment"
        description={`Are you sure you want to delete "${selectedAssignment?.title?.replace(/"/g, '')}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="contained"
        cancelVariant="outlined"
      />

      <ToastComponent />
    </Box>
  );
};

export default MyAssignments;
