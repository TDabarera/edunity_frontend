import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, Alert } from '@mui/material';
import { SearchBar } from '../atoms';
import { AssignmentCard } from '../molecules';
import { DeleteAssignment, GetAssignmentPdfUrl, GetAllClasses, GetAllAssignments } from '../../services';
import { useAuth } from '../../context/AuthContext';
import ManageSubmissons from './ManageSubmissons';
import UploadOrEditAssignment from './UploadOrEditAssignment';
import Popup from './Popup';
import { useToast } from './useToast';
import colors from '../../styles/colors';
import { openPdfInNewTab } from '../../utils/openPdfInNewTab';
import { decodeJWT } from '../../utils/jwtUtils';

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

const getAssignmentsFromResponse = (response) => {
  if (Array.isArray(response?.assignments)) {
    return response.assignments;
  }

  if (Array.isArray(response?.data?.assignments)) {
    return response.data.assignments;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const AllAssignments = ({ onAssignmentClick }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classNameLookup, setClassNameLookup] = useState({});
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editAssignmentOpen, setEditAssignmentOpen] = useState(false);
  const [editAssignmentData, setEditAssignmentData] = useState(null);
  const { showToast, Toast: ToastComponent } = useToast();

  const token = localStorage.getItem('edunity_token');
  const decodedToken = token ? decodeJWT(token) : null;
  const tokenRole = String(
    decodedToken?.role ||
    decodedToken?.userType ||
    decodedToken?.user?.role ||
    decodedToken?.user?.userType ||
    ''
  ).toLowerCase();
  const fallbackRole = String(user?.role || '').toLowerCase();
  const normalizedRole = tokenRole || fallbackRole;
  const canManageSubmissions = normalizedRole === 'teacher' || normalizedRole === 'admin';
  const canViewAllAssignments = canManageSubmissions;

  const filteredAssignments = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return assignments;
    }

    return assignments.filter((assignment) => {
      const title = String(assignment?.title || '').toLowerCase();
      return title.includes(normalizedSearchTerm);
    });
  }, [assignments, searchTerm]);

  const fetchAllAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await GetAllAssignments();

      setAssignments(getAssignmentsFromResponse(response));
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch assignments';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error fetching all assignments:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

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

  useEffect(() => {
    if (canViewAllAssignments) {
      fetchAllAssignments();
    }
  }, [canViewAllAssignments, fetchAllAssignments]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleEdit = (assignment) => {
    setSelectedAssignmentForSubmissions(null);
    setEditAssignmentData(assignment);
    setEditAssignmentOpen(true);
  };

  const handleEditCancel = () => {
    setEditAssignmentOpen(false);
    setEditAssignmentData(null);
  };

  const handleEditSuccess = async (response) => {
    showToast(response?.message || 'Assignment updated successfully!', 'success');
    setEditAssignmentOpen(false);
    setEditAssignmentData(null);
    await fetchAllAssignments();
  };

  const handleDeleteClick = (assignment) => {
    setSelectedAssignment(assignment);
    setDeleteConfirmOpen(true);
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

  const handleOpenManageSubmissions = (assignment) => {
    setSelectedAssignmentForSubmissions(assignment);
  };

  const handleCloseManageSubmissions = () => {
    setSelectedAssignmentForSubmissions(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSelectedAssignment(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAssignment?._id) {
      return;
    }

    try {
      await DeleteAssignment(selectedAssignment._id);
      setAssignments((prev) => prev.filter((assignment) => assignment._id !== selectedAssignment._id));
      setSelectedAssignmentForSubmissions((prev) => {
        if (prev?._id === selectedAssignment._id) {
          return null;
        }

        return prev;
      });
      showToast('Assignment deleted successfully!', 'success');
      setDeleteConfirmOpen(false);
      setSelectedAssignment(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete assignment';
      showToast(errorMessage, 'error');
      console.error('Error deleting assignment:', err);
    }
  };

  return (
    <Box sx={{ p: 3, border: `1px solid ${colors.primary.grey}`, borderRadius: 2 }}>
      {editAssignmentOpen ? (
        <UploadOrEditAssignment
          mode="edit"
          assignmentData={editAssignmentData}
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
            All Assignments
          </Typography>

          <Box sx={{ mb: 4 }}>
            <SearchBar
              placeholder="Search by assignment title..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Box>

          {selectedAssignmentForSubmissions && (
            <Box sx={{ mb: 3 }}>
              <ManageSubmissons
                assignment={selectedAssignmentForSubmissions}
                onClose={handleCloseManageSubmissions}
              />
            </Box>
          )}

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

          {!loading && filteredAssignments.length === 0 && !error && (
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
                {searchTerm ? `No assignments found for "${searchTerm}".` : 'No assignments found.'}
              </Typography>
            </Box>
          )}

          {!loading && filteredAssignments.length > 0 && (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: colors.text.secondary,
                  mb: 2,
                  fontWeight: 500,
                }}
              >
                Found {filteredAssignments.length} result{filteredAssignments.length > 1 ? 's' : ''}
              </Typography>
              <Grid container spacing={2}>
                {filteredAssignments.map((assignment) => (
                  <Grid item xs={12} sm={6} md={4} key={assignment._id}>
                    <AssignmentCard
                      assignment={assignment}
                      classNameLookup={classNameLookup}
                      onClick={() => handleCardClick(assignment)}
                      showActions={true}
                      showViewSubmissionsAction={canManageSubmissions}
                      onViewSubmissions={canManageSubmissions ? () => handleOpenManageSubmissions(assignment) : undefined}
                      onEdit={() => handleEdit(assignment)}
                      onDelete={() => handleDeleteClick(assignment)}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}

      <Popup
        open={deleteConfirmOpen}
        title="Delete Assignment"
        description={`Are you sure you want to delete "${String(selectedAssignment?.title || '').replace(/"/g, '')}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ToastComponent />
    </Box>
  );
};

export default AllAssignments;