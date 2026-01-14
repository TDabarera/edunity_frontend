import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import colors from '../../styles/colors';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: colors.footerBg }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link color="inherit" href="#">
            EdUnity
          </Link>{' '}
          {new Date().getFullYear()}
          {'. Built with passion for education.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;