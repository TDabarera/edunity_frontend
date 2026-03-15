import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Avatar, Chip } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { GetUserChildren, GetAllClasses } from '../../services';
import colors from '../../styles/colors';

const ParentChildren = ({ parentUserId }) => {
  const [children, setChildren] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('[ParentChildren] Parent User ID:', parentUserId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all classes first
        const classesRes = await GetAllClasses();
        const allClasses = classesRes?.data || classesRes?.classes || [];
        setClasses(allClasses);
        
        // Try to fetch parent's children from dedicated endpoint
        try {
          const childrenRes = await GetUserChildren(parentUserId);
          const childrenData = childrenRes?.children || [];
          
          console.log('[ParentChildren] Children count:', childrenRes?.count);
          console.log('[ParentChildren] Children data:', childrenData);
          setChildren(childrenData);
        } catch (apiErr) {
          console.error('[ParentChildren] GetUserChildren failed:', apiErr);
          console.log('[ParentChildren] API might not be implemented yet, showing empty list');
          // If the endpoint doesn't exist, just show empty
          setChildren([]);
        }
      } catch (err) {
        console.error('[ParentChildren] Failed to fetch data:', err);
        setChildren([]);
      } finally {
        setLoading(false);
      }
    };

    if (parentUserId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [parentUserId]);

  const getClassName = (classId) => {
    if (!classId) return 'No class';
    const classObj = classes.find(c => c._id === classId);
    if (!classObj) return 'No class';
    return classObj.className || `${classObj.level || ''}${classObj.order || ''} ${classObj.year || ''}`.trim() || 'No class';
  };

  if (!parentUserId) {
    return null;
  }

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>My Children</Typography>
        <Typography variant="body2" color="text.secondary">Loading...</Typography>
      </Paper>
    );
  }

  if (children.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>My Children</Typography>
        <Typography variant="body2" color="text.secondary">
          No children linked to this account
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>My Children</Typography>
      <Grid container spacing={2}>
        {children.map((child) => (
          <Grid item xs={12} sm={6} md={4} key={child._id}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                border: `1px solid ${colors.primary.greyLight}`,
                borderRadius: 1,
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: colors.primary.greyLight,
                }
              }}
            >
              <Avatar sx={{ bgcolor: colors.primary.main }}>
                <PersonIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  {`${child.firstName || ''} ${child.lastName || ''}`.trim()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {child.accountNumber || child.accountNo || 'N/A'}
                </Typography>
                <Chip
                  label={getClassName(child.classId)}
                  size="small"
                  sx={{ mt: 0.5, fontSize: '0.75rem' }}
                  color={child.classId ? 'primary' : 'default'}
                />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ParentChildren;
