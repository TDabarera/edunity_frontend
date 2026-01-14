import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const SelectInput = ({ label, value, onChange, options, error, ...props }) => {
  return (
    <TextField
      select
      fullWidth
      margin="normal"
      variant="outlined"
      label={label}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error}
      {...props}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectInput;