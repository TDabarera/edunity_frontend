import React from 'react';
import { Box, Typography } from '@mui/material';
import colors from '../../styles/colors';

const LoginWelcome = () => (
  <Box sx={{ textAlign: 'center', color: colors.primary.contrastText, p: 2 }}>
    <Typography variant="h3" fontWeight="bold" textAlign="center">
      Good to see you again!
    </Typography>
    <Typography variant="h6">
      Log in to manage your account and stay connected.
    </Typography>
  </Box>
);

export default LoginWelcome;