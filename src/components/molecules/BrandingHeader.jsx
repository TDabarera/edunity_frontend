import React from 'react';
import { Box, Typography } from '@mui/material';
import colors from '../../styles/colors';

const BrandingHeader = () => (
  <Box sx={{ textAlign: 'center', mb: 4 }}>
    <Box 
      component="img"
      src="/Logo/EdUnityLogo.png"
      alt="Logo"
      sx={{ mb: 1, maxHeight: "70px" }}
    />
    <Typography variant="h4" fontWeight="bold" color={colors.primary.main}>
      EdUnity
    </Typography>
    <Typography variant="body1" color={colors.text.secondary}>
      Personalised Communication Dashboard
    </Typography>
  </Box>
);

export default BrandingHeader;