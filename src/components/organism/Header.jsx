import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School'; // Run: npm install @mui/icons-material

const Header = ({ isLoggedIn, user }) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a237e' }}>
      <Toolbar>
        {/* Logo Placeholder */}
        <SchoolIcon sx={{ mr: 1 }} />
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          EdUnity
        </Typography>

        <Box>
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* User Info Section */}
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ lineHeight: 1 }}>
                  {user.name}
                </Typography>
                <Chip 
                  label={user.role} 
                  size="small" 
                  color="secondary" 
                  sx={{ height: '16px', fontSize: '0.6rem', textTransform: 'uppercase' }} 
                />
              </Box>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {user.name.charAt(0)}
              </Avatar>
              <Button color="inherit" variant="outlined" size="small">Logout</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit">Login</Button>
              <Button variant="contained" color="secondary">Sign Up</Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;