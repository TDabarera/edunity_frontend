import React from 'react';
import { Box } from '@mui/material';
import { Button } from '../atoms';
import colors from '../../styles/colors';
import { useNavigate } from 'react-router-dom';

const NavLinks = ({ firstText, firstLink, secondText, secondLink }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', fontSize: '0.9rem', mt: 3 }}>
      <Button
        variant="text"
        sx={{ color: colors.text.secondary }}
        onClick={() => navigate(firstLink)}
      >
        {firstText}
      </Button>
      
      <Button
        variant="text"
        sx={{ color: colors.text.secondary }}
        onClick={() => navigate(secondLink)}
      >
        {secondText}
      </Button>
    </Box>
  );
};

export default NavLinks;
