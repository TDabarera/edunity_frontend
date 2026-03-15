import React from 'react';
import MuiButton from '@mui/material/Button';
import colors from '../../styles/colors';

const Button = ({ children, onClick, variant = "contained", color = "primary", ...props }) => {
  const getButtonStyles = () => {
    const baseStyles = {
      mt: 2,
      mb: 2,
      px: 4,
      py: 1.5,
      textTransform: 'none',
      fontSize: '1rem',
      fontWeight: 500,
    };

    if (color === 'primary') {
      if (variant === 'contained') {
        return {
          ...baseStyles,
          backgroundColor: colors.button.primaryContained,
          color: '#fff',
          '&:hover': {
            backgroundColor: colors.button.primaryContainedHover,
          },
          '&:disabled': {
            backgroundColor: colors.button.disabled,
            color: colors.button.disabledText,
          },
        };
      } else if (variant === 'outlined') {
        return {
          ...baseStyles,
          borderColor: colors.button.primaryOutlined,
          color: colors.button.primaryOutlined,
          '&:hover': {
            backgroundColor: colors.button.primaryOutlinedHover,
            borderColor: colors.button.primaryOutlined,
          },
          '&:disabled': {
            borderColor: colors.button.disabled,
            color: colors.button.disabledText,
          },
        };
      }
    } else if (color === 'secondary') {
      if (variant === 'contained') {
        return {
          ...baseStyles,
          backgroundColor: colors.button.secondaryContained,
          color: '#fff',
          '&:hover': {
            backgroundColor: colors.button.secondaryContainedHover,
          },
          '&:disabled': {
            backgroundColor: colors.button.disabled,
            color: colors.button.disabledText,
          },
        };
      }
    }

    return baseStyles;
  };

  return (
    <MuiButton
      variant={variant}
      color={color}
      onClick={onClick}
      sx={getButtonStyles()}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;