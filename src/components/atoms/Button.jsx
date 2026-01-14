import React from 'react';
import MuiButton from '@mui/material/Button';

const Button = ({ children, onClick, variant = "contained", color = "primary", ...props }) => {
  // MUI handles 'primary', 'secondary', 'error', 'success' via the 'color' prop
  return (
    <MuiButton 
      variant={variant} 
      color={color} 
      onClick={onClick} 
      sx={{ mt: 2, mb: 2 }} // Simple margin top/bottom for spacing
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;