import React, { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/templates/MainLayout';
import { Button } from '../components/atoms';
import { PageTitle } from '../components/molecules';
import { DueAssignments, SearchAssignment, MyAssignments, MySubmissions, SubmitorEditAssignment } from '../components/organisms';
import { useAuth } from '../context/AuthContext';
import { decodeJWT } from '../utils/jwtUtils';

const Assignments = () => {
  const { isLoggedIn, isAuthInitialized, user } = useAuth();
  const navigate = useNavigate();
  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [submissionsRefreshToken, setSubmissionsRefreshToken] = useState(0);
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
  const isAdmin = normalizedRole === 'admin';
  const isTeacher = normalizedRole === 'teacher';
  const isStudent = normalizedRole === 'student';
  const isParent = normalizedRole === 'parent';
  const canViewDueAssignments = isStudent || isParent;
  const canManageAssignments = isAdmin || isTeacher;
  const canViewStudentSubmissions = isStudent;

  useEffect(() => {
    if (isAuthInitialized && !isLoggedIn) {
      navigate('/login');
    }
  }, [isAuthInitialized, isLoggedIn, navigate]);

  if (!isAuthInitialized || !isLoggedIn) return null;

  const handleSubmissionSuccess = () => {
    setShowAddSubmission(false);
    setSubmissionsRefreshToken((prev) => prev + 1);
  };

  return (
    <MainLayout isLoggedIn={isLoggedIn} user={user}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageTitle
          title="Assignments"
          subtitle="View due assignments, search assignments, and manage your assignments."
        />

        {canViewDueAssignments && (
          <Box sx={{ mt: 3 }}>
            <DueAssignments />
          </Box>
        )}

        {canManageAssignments && (
          <Box sx={{ mt: 3 }}>
            <SearchAssignment />
          </Box>
        )}

        {canManageAssignments && (
          <Box sx={{ mt: 3 }}>
            <MyAssignments />
          </Box>
        )}

        {canViewStudentSubmissions && (
          <Box sx={{ mt: 3 }}>
            {!showAddSubmission && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" onClick={() => setShowAddSubmission(true)}>
                  Add Submission
                </Button>
              </Box>
            )}

            {showAddSubmission ? (
              <SubmitorEditAssignment
                mode="submit"
                onSuccess={handleSubmissionSuccess}
                onCancel={() => setShowAddSubmission(false)}
              />
            ) : (
              <MySubmissions key={submissionsRefreshToken} />
            )}
          </Box>
        )}
      </Container>
    </MainLayout>
  );
};

export default Assignments;
