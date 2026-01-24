import React from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const AttendanceRowActions = ({ studentName, accountNumber, initialStatus, onStatusChange }) => {
  const handleStatusChange = (event, newStatus) => {
    if (newStatus !== null && onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {studentName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Account: {accountNumber}
        </Typography>
      </Box>

      <ToggleButtonGroup
        value={status}
        exclusive
        onChange={handleStatusChange}
        size="small"
        sx={{ 
          '& .MuiToggleButton-root': {
            px: 2,
            py: 0.5,
            border: '1px solid',
            borderRadius: 1,
          }
        }}
      >
        <ToggleButton 
          value="present"
          sx={{
            m:2,
            '&.Mui-selected': {
              backgroundColor:'#4caf50',
              color: 'white',
              '&:hover': {
                backgroundColor:'#388e3c',
              },
            },
          }}
        >
          <CheckCircle sx={{ mr: 0.5, fontSize: 18 }} />
          Present
        </ToggleButton>
        <ToggleButton 
          value="absent"
          sx={{
            m:2,
            '&.Mui-selected': {
              backgroundColor:'#f44336',
              color: 'white',
              '&:hover': {
                backgroundColor:'#d32f2f',
              },
            },
          }}
        >
          <Cancel sx={{ mr: 0.5, fontSize: 18 }} />
          Absent
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default AttendanceRowActions;
