import React, { useState } from 'react';
import { Grid, Box } from '@mui/material';
import colors from '../styles/colors';
import { BrandingHeader, NavLinks } from '../components/molecules';
import { SignupForm, Banner, Toast } from '../components/organisms';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/organisms/Toast';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  const handleSignup = async (e, data) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(data);
      showToast('Signup successful!', 'success');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const errorMsg = err.message || 'Signup failed';
      showToast(errorMsg, 'error');
      setLoading(false);
    }
  };

  return (
    <>
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
            {/* Support Banner */}
          <Box sx={{ mb:4 }}>
            <Banner
              heading="Need Help?"
              subheading="Signing up with EdUnity"
              description="Fill in the following form and Edunity Team will get back to you shortly."
              avatarImage="/Characters/SignUp.png"
              backgroundColor="white"
            />
          </Box>
            <SignupForm onSubmit={handleSignup} loading={loading} />
            <NavLinks
              firstText="Back to Home"
              firstLink="/"
              secondText="Already have an account? Log in"
              secondLink="/login"
            />
          </Box>
        </Grid>
      </Grid>
      <ToastComponent open={open} message={message} severity={severity} onClose={closeToast} />
    </>
  );
};

export default Signup;
