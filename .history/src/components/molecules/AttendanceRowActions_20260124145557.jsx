import React, { useState } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import colors from '../../styles/colors';

const AttendanceRowActions = ({ studentName, accountNumber, initialStatus, onStatusChange }) => {
  const [status, setStatus] = useState(initialStatus || null);

  const handleStatusChange = (event, newStatus) => {
    if (newStatus !== null) {
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
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
            '&.Mui-selected': {
              backgroundColor: colors.success?.main || '#4caf50',
              color: 'white',
              m:2,
              '&:hover': {
                backgroundColor: colors.success?.dark || '#388e3c',
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
            '&.Mui-selected': {
              backgroundColor: colors.error?.main || '#f44336',
              color: 'white',
              '&:hover': {
                backgroundColor: colors.error?.dark || '#d32f2f',
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
