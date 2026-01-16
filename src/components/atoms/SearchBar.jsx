import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import colors from '../../styles/colors';

const SearchBar = ({ placeholder = 'Search...', value, onChange, ...props }) => {
  return (
    <TextField
      size="medium"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      variant="outlined"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: colors.text.secondary }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        width: '100%',
        padding: 5,
        '& .MuiOutlinedInput-root': {
          borderColor: colors.primary.light,
          '&:hover fieldset': {
            borderColor: colors.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderColor: colors.primary.main,
          },
        },
        '& .MuiOutlinedInput-input': {
          color: colors.text.primary,
          '&::placeholder': {
            color: colors.text.secondary,
            opacity: 0.9,
          },
        },
      }}
      {...props}
    />
  );
};

export default SearchBar;
