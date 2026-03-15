import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Header, Footer, Sidebar } from '../organisms';
import colors from '../../styles/colors';


const MainLayout = ({ children, isLoggedIn, user }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleDrawer = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Header isLoggedIn={isLoggedIn} user={user} />
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {isLoggedIn && (
          <Sidebar 
            open={isSidebarOpen} 
            toggleDrawer={toggleDrawer} 
            userRole={user?.role} 
          />
        )}
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            backgroundColor: colors.mainBg,
            transition: 'margin 0.3s'
          }}
        >
          {children}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default MainLayout;