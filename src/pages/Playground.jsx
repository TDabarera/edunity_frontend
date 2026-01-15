import React, { useState } from 'react';
import { Box, Button, Container } from '@mui/material';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import HomeLoggedIn from './HomeLoggedIn';
import HomeNotLoggedIn from './HomeNotLoggedIn';

const Playground = () => {
  const [currentPage, setCurrentPage] = useState('login');

  const handleLoginSuccess = (token) => {
    console.log('Login successful with token:', token);
  };

  const handleSignupSuccess = (token) => {
    console.log('Signup successful with token:', token);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Navigation Buttons */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, bgcolor: 'grey.100' }}>
        <Button 
          variant={currentPage === 'login' ? 'contained' : 'outlined'} 
          color="primary"
          onClick={() => setCurrentPage('login')}
        >
          Login Page
        </Button>
        <Button 
          variant={currentPage === 'signup' ? 'contained' : 'outlined'} 
          color="primary"
          onClick={() => setCurrentPage('signup')}
        >
          Signup Page
        </Button>
          <Button 
          variant={currentPage === 'home' ? 'contained' : 'outlined'} 
          color="primary"
          onClick={() => setCurrentPage('home')}
        >
          HomePage
        </Button>
        <Button 
          variant={currentPage === 'homeNotLoggedIn' ? 'contained' : 'outlined'} 
          color="primary"
          onClick={() => setCurrentPage('homeNotLoggedIn')}
        >
          Home Not Logged In
        </Button>
      </Box>

      {/* Page Display */}
      <Box>
        {currentPage === 'login' && <Login onLoginSuccess={handleLoginSuccess} />}
        {currentPage === 'signup' && <Signup onSignupSuccess={handleSignupSuccess} />}
        {currentPage === 'home' && <Home />} 
        {currentPage === 'homeNotLoggedIn' && <HomeNotLoggedIn />}
      </Box>
    </Box>
  );
};

export default Playground;
