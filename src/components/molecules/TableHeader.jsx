import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';
import colors from '../../styles/colors';

const TableHeader = () => {
  const columns = [
    { label: 'Name', align: 'left' },
    { label: 'Email', align: 'left' },
    { label: 'User Type', align: 'left' },
    { label: 'Phone', align: 'left' },
    { label: 'Account No', align: 'left' },
    { label: 'Actions', align: 'center' },
  ];

  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: colors.primary.light }}>
        {columns.map((column) => (
          <TableCell
            key={column.label}
            align={column.align}
            sx={{
              fontWeight: 'bold',
              color: colors.primary.contrastText,
              backgroundColor: colors.primary.light,
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              letterSpacing: '0.5px',
            }}
          >
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
