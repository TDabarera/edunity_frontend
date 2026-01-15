import React from 'react';
import TextField from '@mui/material/TextField';

const Input = ({ label, type = "text", value, onChange, error, helperText, ...props }) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      margin="normal"
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={helperText}
      {...props}
    />
  );
};

export default Input;