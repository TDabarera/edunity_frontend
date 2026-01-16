import {
  AccountCircle, People, EventNote, Class, 
  Assessment
} from '@mui/icons-material';

// Menu Configuration: Role-based navigation items
export const menuConfig = [
  { text: 'My Account', icon: AccountCircle, roles: ['Admin', 'Teacher', 'Student'] },
  { text: 'User Management', icon: People, roles: ['Admin'] },
  { text: 'Class Management', icon: Class, roles: ['Admin', 'Teacher'] },
  { text: 'Attendance', icon: EventNote, roles: ['Teacher','Admin'] },
  { text: 'Student Grades', icon: Assessment, roles: ['Teacher', 'Admin'] },
  { text: 'My Grades', icon: Assessment, roles: ['Student','Admin'] },
];
