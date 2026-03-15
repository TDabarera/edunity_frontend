import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Grid, Alert } from '@mui/material';
import { AssignmentCard } from '../molecules';
import { GetMyAssignments, GetAssignmentPdfUrl, GetAllClasses } from '../../services';
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

const DueAssignments = ({ onAssignmentClick }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classNameLookup, setClassNameLookup] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, classesResponse] = await Promise.all([GetMyAssignments(), GetAllClasses()]);

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
      setError(err.message || 'Failed to fetch assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (assignment) => {
    try {
      await openPdfInNewTab(() => GetAssignmentPdfUrl(assignment._id));

      if (onAssignmentClick) {
        onAssignmentClick(assignment);
      }
    } catch (err) {
      console.error('Error opening assignment PDF:', err);
      setError(err.message || 'Failed to open assignment PDF');
    }
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
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: colors.primary.dark,
          mb: 3,
        }}
      >
        Due Assignments
      </Typography>

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
            No assignments due at this time.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {assignments.map((assignment) => (
            <Grid item xs={12} sm={6} md={4} key={assignment._id}>
              <AssignmentCard
                assignment={assignment}
                classNameLookup={classNameLookup}
                onClick={() => handleCardClick(assignment)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DueAssignments;
