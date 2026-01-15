import React, { useState } from 'react';
import { Grid, Box } from '@mui/material';
import colors from '../styles/colors';
import { BrandingHeader } from '../components/molecules';
import { SignupForm } from '../components/organisms';
import { Gradient } from '@mui/icons-material';

const Signup = ({ onSignupSuccess }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e, data) => {
    e.preventDefault();
    setLoading(true);
    setError(null);


    // Mock signup logic
    try {
      if (data.email && data.password) {
        onSignupSuccess("TOKEN_HERE");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Grid container
    sx={{
        width: '100%',
        background: `linear-gradient(to top, ${colors.primary.light}, ${colors.mainBg})`,
        minHeight: '100vh',
        m: -1,
        
        }}>
      {/* Main Column - Centered Form */}
      <Grid item xs={12} md={8} lg={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', m: 'auto', p: 4 }}>
        {/* Inner Content Box */}
        <Box sx={{ width: '100%', maxWidth: '900px', position: 'relative' }}>
          <BrandingHeader />
          <SignupForm onSubmit={handleSignup} error={error} loading={loading} />
          
          
        </Box>
      </Grid>
    </Grid>
  );
};

export default Signup;
