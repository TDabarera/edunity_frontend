import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, Alert } from '@mui/material';
import { SubmissionCard } from '../molecules';
import { GetMySubmissions, GetAllClasses, DeleteSubmissionById, GetSubmissionPdfUrl, ResolveSubmissionFileUrl } from '../../services';
import { useToast } from './useToast';
import Popup from './Popup';
import SubmitorEditAssignment from './SubmitorEditAssignment';
import colors from '../../styles/colors';
import { openPdfInNewTab } from '../../utils/openPdfInNewTab';

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

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classNameLookup, setClassNameLookup] = useState({});
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editSubmissionOpen, setEditSubmissionOpen] = useState(false);
  const [editAssignmentId, setEditAssignmentId] = useState('');
  const { showToast, Toast: ToastComponent } = useToast();

  const getAssignmentIdFromSubmission = (submission) => {
    const assignment = submission?.assignmentId;
    if (!assignment) return '';
    if (typeof assignment === 'object') {
      return assignment._id || assignment.id || '';
    }
    return String(assignment);
  };

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [submissionsResult, classesResult] = await Promise.allSettled([
        GetMySubmissions(),
        GetAllClasses(),
      ]);

      if (submissionsResult.status === 'rejected') {
        throw submissionsResult.reason;
      }

      const submissionsResponse = submissionsResult.value;
      setSubmissions(submissionsResponse?.submissions || []);

      if (classesResult.status !== 'fulfilled') {
        setClassNameLookup({});
        console.warn('Unable to fetch class metadata for submissions:', classesResult.reason);
        return;
      }

      const classesResponse = classesResult.value;

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
    } catch (err) {
      setError(err.message || 'Failed to fetch submissions');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleEditClick = (submission) => {
    const assignmentId = getAssignmentIdFromSubmission(submission);

    if (!assignmentId) {
      showToast('Assignment ID is missing for this submission.', 'warning');
      return;
    }

    setEditAssignmentId(assignmentId);
    setEditSubmissionOpen(true);
  };

  const handleDeleteClick = (submission) => {
    setSelectedSubmission(submission);
    setDeleteConfirmOpen(true);
  };

  const handleCardClick = async (submission) => {
    const assignmentId = getAssignmentIdFromSubmission(submission);

    if (!assignmentId || !submission?._id) {
      showToast('Assignment or submission ID is missing for this PDF.', 'warning');
      return;
    }

    try {
      await openPdfInNewTab({
        getImmediatePdfUrl: () => ResolveSubmissionFileUrl(submission?.fileUrl || submission?.file),
        getPdfUrl: () => GetSubmissionPdfUrl(assignmentId, submission._id),
      });
    } catch (err) {
      showToast(err.message || 'Failed to open submission PDF', 'error');
      console.error('Error opening submission PDF:', err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedSubmission(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubmission?._id) return;

    try {
      const response = await DeleteSubmissionById(selectedSubmission._id);
      showToast(response?.message || 'Submission deleted successfully!', 'success');
      setDeleteConfirmOpen(false);
      setSelectedSubmission(null);
      await fetchSubmissions();
    } catch (err) {
      showToast(err.message || 'Failed to delete submission', 'error');
    }
  };

  const handleEditSuccess = async (response) => {
    showToast(response?.message || 'Submission updated successfully!', 'success');
    setEditSubmissionOpen(false);
    setEditAssignmentId('');
    await fetchSubmissions();
  };

  const handleEditCancel = () => {
    setEditSubmissionOpen(false);
    setEditAssignmentId('');
  };

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
      {editSubmissionOpen ? (
        <SubmitorEditAssignment
          mode="edit"
          assignmentId={editAssignmentId}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      ) : (
        <>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: colors.primary.dark,
          mb: 3,
        }}
      >
        My Submissions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {submissions.length === 0 ? (
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
            No submissions found.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {submissions.map((submission) => (
            <Grid item xs={12} sm={6} md={4} key={submission._id}>
              <SubmissionCard
                submission={submission}
                classNameLookup={classNameLookup}
                onClick={() => handleCardClick(submission)}
                showActions={true}
                onEdit={() => handleEditClick(submission)}
                onDelete={() => handleDeleteClick(submission)}
              />
            </Grid>
          ))}
        </Grid>
      )}
        </>
      )}

      <Popup
        open={deleteConfirmOpen}
        title="Delete Submission"
        description={`Are you sure you want to delete submission for "${String(selectedSubmission?.assignmentId?.title || '').replace(/"/g, '')}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ToastComponent />
    </Box>
  );
};

export default MySubmissions;
