import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, Alert } from '@mui/material';
import { SearchBar } from '../atoms';
import { AssignmentCard } from '../molecules';
import { SearchAssignmentsByTitle, GetAssignmentById, GetAllClasses } from '../../services';
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

const SearchAssignment = ({ onAssignmentClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [classNameLookup, setClassNameLookup] = useState({});

  useEffect(() => {
    const fetchClassLookup = async () => {
      try {
        const classesResponse = await GetAllClasses();
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
        console.error('Error fetching class names:', err);
      }
    };

    fetchClassLookup();
  }, []);

  const handleSearch = async (value) => {
    setSearchTerm(value);
    
    if (!value.trim()) {
      setAssignments([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const data = await SearchAssignmentsByTitle(value);
      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err.message || 'Failed to search assignments');
      console.error('Error searching assignments:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (assignment) => {
    try {
      const assignmentData = await GetAssignmentById(assignment._id);
      if (onAssignmentClick) {
        onAssignmentClick(assignmentData);
      }
    } catch (err) {
      console.error('Error fetching assignment details:', err);
      setError('Failed to load assignment details');
    }
  };

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
        Search Assignments
      </Typography>

      <Box sx={{ mb: 4 }}>
        <SearchBar
          placeholder="Search by assignment title..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
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
      )}

      {!loading && hasSearched && assignments.length === 0 && !error && (
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
            No assignments found for "{searchTerm}".
          </Typography>
        </Box>
      )}

      {!loading && assignments.length > 0 && (
        <>
          <Typography
            variant="body2"
            sx={{
              color: colors.text.secondary,
              mb: 2,
              fontWeight: 500,
            }}
          >
            Found {assignments.length} result{assignments.length > 1 ? 's' : ''}
          </Typography>
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
        </>
      )}

      {!loading && !hasSearched && (
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
            Enter a search term to find assignments.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SearchAssignment;
