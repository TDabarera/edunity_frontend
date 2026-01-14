import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Divider, IconButton, Box 
} from '@mui/material';
import {
  AccountCircle, People, EventNote, Class, 
  Assessment, ChevronLeft, ChevronRight, Menu
} from '@mui/icons-material';

// 1. Menu Configuration: Industrial practice to keep logic clean
const menuConfig = [
  { text: 'My Account', icon: <AccountCircle />, roles: ['Admin', 'Teacher', 'Student'] },
  { text: 'User Management', icon: <People />, roles: ['Admin'] },
  { text: 'Attendance', icon: <EventNote />, roles: ['Teacher'] },
  { text: 'Class Management', icon: <Class />, roles: ['Teacher'] },
  { text: 'Student Grades', icon: <Assessment />, roles: ['Teacher', 'Admin'] },
  { text: 'My Grades', icon: <Assessment />, roles: ['Student'] },
];

const Sidebar = ({ open, toggleDrawer, userRole }) => {
  const drawerWidth = 240;

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
          top: '64px', // Keeps it below the header
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: open ? 'flex-end' : 'center', p: 1 }}>
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeft /> : <Menu />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuConfig
          .filter(item => item.roles.includes(userRole)) // Role-based filtering
          .map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;