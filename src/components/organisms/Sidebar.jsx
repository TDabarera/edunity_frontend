import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Divider, IconButton, Box 
} from '@mui/material';
import {
  ChevronLeft, Menu, Dashboard
} from '@mui/icons-material';
import { menuConfig } from '../../constants';
import colors from '../../styles/colors';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ open, toggleDrawer, userRole = 'Admin' }) => {
  const drawerWidth = 240;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Map menu text to routes
  const menuRoutes = {
    'Dashboard': '/',
    'My Account': '/my-account',
    'User Management': '/user-management',
    'Class Management': '/class-management',
    'Assignments': '/assignments',
    'Notifications': '/notifications',
    'Parents': '/parent-management',
    'Attendance': '/attendance',
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
        {/* Dashboard Link - Always visible */}
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => {
              navigate('/');
              toggleDrawer(false);
            }}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              color: 'white',
              backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
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
              <Dashboard sx={{ fontSize: 32 }} />
            </ListItemIcon>
            <Box
              sx={{
                overflow: 'hidden',
                width: open ? 'auto' : 0,
                transition: 'width 0.3s ease',
              }}
            >
              <ListItemText 
                primary="Dashboard" 
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
                    backgroundColor: location.pathname === menuRoutes[item.text] ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: location.pathname === menuRoutes[item.text] ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
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