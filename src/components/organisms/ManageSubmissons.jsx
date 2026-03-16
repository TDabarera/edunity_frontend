import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, IconButton, Tooltip } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { SubmissionActionRow } from '../molecules';
import { GetSubmissionsByAssignmentId, ResolveSubmissionFileUrl, GetSubmissionPdfUrl, GetAllClasses } from '../../services';
import { openPdfInNewTab } from '../../utils/openPdfInNewTab';
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

const ManageSubmissons = ({ assignment, onClose }) => {
  const assignmentId = assignment?._id || assignment?.id || '';
  const [submissions, setSubmissions] = useState([]);
  const [classNameLookup, setClassNameLookup] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!assignmentId) {
        setSubmissions([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [submissionsResponse, classesResponse] = await Promise.all([
          GetSubmissionsByAssignmentId(assignmentId),
          GetAllClasses(),
        ]);

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
        setSubmissions(submissionsResponse?.submissions || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch submissions');
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  const handleView = async (submission) => {
    try {
      await openPdfInNewTab({
        getImmediatePdfUrl: () => ResolveSubmissionFileUrl(submission?.fileUrl || submission?.file),
        getPdfUrl: () => GetSubmissionPdfUrl(assignmentId, submission?._id),
      });
    } catch (err) {
      setError(err.message || 'Failed to open submission file');
    }
  };

  const handleDownload = (submission) => {
    try {
      const fileUrl = ResolveSubmissionFileUrl(submission?.file);
      const downloadName = decodeURIComponent(
        String(submission?.file || '').split('/').pop() || `submission-${submission?._id || 'file'}.pdf`
      );

      const anchor = document.createElement('a');
      anchor.href = fileUrl;
      anchor.download = downloadName;
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (err) {
      setError(err.message || 'Failed to download submission file');
    }
  };

  if (!assignmentId) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 3,
        border: `1px solid ${colors.primary.grey}`,
        borderRadius: 2,
        backgroundColor: '#fff',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: colors.primary.dark, fontWeight: 600 }}>
          Submissions for - {String(assignment?.title || 'Assignment').replace(/"/g, '')}
        </Typography>
        {onClose && (
          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '160px',
          }}
        >
          <CircularProgress sx={{ color: colors.primary.main }} />
        </Box>
      ) : submissions.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            borderRadius: 2,
            border: `1px solid ${colors.primary.grey}`,
            backgroundColor: colors.primary.greyLight,
          }}
        >
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            No submissions found for this assignment.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {submissions.map((submission) => (
            <SubmissionActionRow
              key={submission?._id || `${submission?.studentId?._id || 'student'}-${submission?.submittedAt || 'row'}`}
              submission={submission}
              classNameLookup={classNameLookup}
              onView={handleView}
              onDownload={handleDownload}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ManageSubmissons;