import React, { useState } from 'react';
import { Grid, Box } from '@mui/material';
import colors from '../styles/colors';
import { BrandingHeader, LoginWelcome } from '../components/molecules';
import { LoginForm } from '../components/organisms';

const Login = ({ onLoginSuccess }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e, data) => {
    e.preventDefault();
    setLoading(true);
    if (data.email === "jane@example.com" && data.password === "pass") {
      onLoginSuccess("TOKEN_HERE");
    } else if (!data.email || !data.password) {
      setError("Please fill in all fields.");
      setLoading(false);  
    } else {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <Grid 
      container 
      sx={{ 
        height: '100vh',   // Spans the full viewport height
        width: '100%',     // Spans full width
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
          width: '50%',
        }}
      >
        {/* Inner Content Box for Width Control */}
        <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <BrandingHeader />
          <LoginForm onSubmit={handleLogin} error={error} loading={loading} />
        </Box>
      </Grid>

      {/* --- Right Column (Welcome + Color) --- */}
      <Grid 
        item 
        xs={false} // Hides element on extra-small screens (mobile)
        md={6} 
        sx={{
          display:'flex', // Ensure it's Flex on Desktop, None on Mobile
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          backgroundImage:"url('/Posters/Gradient.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          width: '50%',
          m:0,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
         <LoginWelcome />
         <img 
           src="\Characters\LogIn.png" 
           alt="Smiling cartoon character with raised hand in a welcoming gesture, standing in a bright and colorful digital environment designed for a login page. The mood is friendly and inviting." 
           style={{ width: '100%', maxWidth: '400px' }} 
         />
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;