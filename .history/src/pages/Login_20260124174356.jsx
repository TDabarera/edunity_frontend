import React, { useState } from 'react';
import { Grid, Box } from '@mui/material';
import colors from '../styles/colors';
import { BrandingHeader, LoginWelcome, NavLinks } from '../components/molecules';
import { LoginForm, Toast } from '../components/organisms';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/organisms/useToast';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { open, message, severity, showToast, closeToast, Toast: ToastComponent } = useToast();

  const handleLogin = async (e, data) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(data.email, data.password);
      showToast('Login successful!', 'success');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const errorMsg = err.message || err.data?.message || 'Login failed';
      showToast(errorMsg, 'error');
      setLoading(false);
    }
  };

  return (
    <>
      <Grid 
        container 
        sx={{ 
          height: '100vh',   // Spans the full viewport height
          width: '100vw',     // Spans full width
          m: -1,            // Remove default margins
        }}
      >
        {/* --- Left Column (Header + Form) --- */}
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // Vertically centers content
            alignItems: 'center',     // Horizontally centers content
            height: '100%',           // Ensures the column fills the screen height
            p: 4,
            m:0,                     // Padding
            bgcolor: colors.mainBg,   // Optional: BG for the form side
            width: { xs: '100vw', md: '50%' },
          }}
        >
          {/* Inner Content Box for Width Control */}
          <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <BrandingHeader />
            <LoginForm onSubmit={handleLogin} loading={loading} />
            <NavLinks
              firstText="Back to Home"
              firstLink="/"
              secondText="Don't have an account? Sign up"
              secondLink="/signup"
            />
          </Box>
        </Grid>

        {/* --- Right Column (Welcome + Color) --- */}
        <Grid 
          item 
          xs={false}
          md={6} 
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundImage:"url('/Posters/Gradient.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            width: { xs: '100vw', md: '50%' },
            m:0,
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', position: 'relative', height: '100%' }}>
           <LoginWelcome />
           <Box
             component="img"
             src="/Characters/LogIn.png" 
             alt="Smiling cartoon character with raised hand in a welcoming gesture, standing in a bright and colorful digital environment designed for a login page. The mood is friendly and inviting." 
             sx={{ 
               position: 'absolute',
               bottom: 0,
               left: 0,
               width: '600px',  // Manual size control
               height: 'auto',
               transform: 'translateX(-63px)',  // Manual x-axis positioning control
             }}
           />
          </Box>
        </Grid>
      </Grid>
      <ToastComponent open={open} message={message} severity={severity} onClose={closeToast} />
    </>
  );
};

export default Login;