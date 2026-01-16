import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Divider, IconButton, Box 
} from '@mui/material';
import {
  ChevronLeft, Menu
} from '@mui/icons-material';
import { menuConfig } from '../../constants';
import colors from '../../styles/colors';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ open, toggleDrawer, userRole = 'Admin' }) => {
  const drawerWidth = 240;
  const navigate = useNavigate();
  
  // Map menu items to routes
  const menuRoutes = {
    'My Account': '/my-account',
    'User Management': '/user-management',
    'Attendance': '/attendance',
    'Class Management': '/class-management',
    'Student Grades': '/student-grades',
    'My Grades': '/my-grades',
  };
  
  // Normalize role to match menuConfig (backend sends capitalized)
  const normalizedRole = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : 'Admin';
  const filteredItems = menuConfig.filter(item => item.roles.includes(normalizedRole));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 60,
        transition: 'width 0.3s',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 60,
          transition: 'width 0.3s',
          overflowX: 'hidden',
          position: 'relative',
          backgroundColor: colors.headerBg,
          color: 'white',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: open ? 'flex-end' : 'center', p: 1 }}>
        <IconButton onClick={toggleDrawer} sx={{ color: 'white' }}>
          {open ? <ChevronLeft /> : <Menu />}
        </IconButton>
      </Box>
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
      <List>
        {filteredItems
          .map((item) => {
            const IconComponent = item.icon;
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => {
                    const route = menuRoutes[item.text];
                    if (route) {
                      navigate(route);
                      toggleDrawer(false);
                    }
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 0, 
                    mr: open ? 3 : 'auto', 
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 32,
                  }}>
                    <IconComponent sx={{ fontSize: 32 }} />
                  </ListItemIcon>
                  <Box
                    sx={{
                      overflow: 'hidden',
                      width: open ? 'auto' : 0,
                      transition: 'width 0.3s ease',
                    }}
                  >
                    <ListItemText 
                      primary={item.text} 
                      sx={{ 
                        color: 'white',
                        opacity: open ? 1 : 0,
                        transition: 'opacity 0.3s ease 0.2s',
                        whiteSpace: 'nowrap',
                      }} 
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>
    </Drawer>
  );
};

export default Sidebar;