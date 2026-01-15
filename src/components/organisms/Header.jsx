import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Chip } from '@mui/material';
import colors from '../../styles/colors';

const Header = ({ isLoggedIn, user }) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: colors.headerBg, padding: 2 }}>
      <Toolbar>
        <Box
          component="img"
          src="/Logo/EdUnityLogo.png"
          alt="EdUnity Logo"
          sx={{
            height: 50,
            mr: 2
          }}
        />
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          EdUnity
        </Typography>

        <Box>
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* User Info Section */}
              <Box sx={{ textAlign: 'center', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ lineHeight: 1, mb: 1 }}>
                  {user.name}
                </Typography>
                <Chip 
                  label={user.role} 
                  size="medium"
                  sx={{ 
                    height: '16px', 
                    fontSize: '0.8rem', 
                    textTransform: 'uppercase', 
                    padding: 2,
                    backgroundColor: colors.secondary.main,
                    color: colors.secondary.contrastText
                  }} 
                />
              </Box>
              <Avatar sx={{ bgcolor: colors.secondary.main }}>
                {user.name.charAt(0)}
              </Avatar>
              <Button color="inherit" variant="outlined" size="small">Logout</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit">Login</Button>
              <Button variant="contained" sx={{ backgroundColor: colors.primary.light, color: colors.primary.contrastText }}>Sign Up</Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;