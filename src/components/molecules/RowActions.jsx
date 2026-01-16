import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import colors from '../../styles/colors';

const RowActions = ({ onEdit, onDelete }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <Tooltip title="Edit">
        <IconButton
          size="small"
          onClick={onEdit}
          sx={{
            color: colors.primary.light,
            '&:hover': {
              backgroundColor: colors.primary.grey,
              color: colors.primary.contrastText,
            },
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={onDelete}
          sx={{
            color: colors.primary.main,
            '&:hover': {
              backgroundColor: colors.primary.main,
              color: colors.primary.contrastText,
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default RowActions;
