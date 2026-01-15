export const API_BASE_URL = 'http://localhost:5000/api/v1';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/login',
  SIGNUP: '/users/createuser',
  LOGOUT: '/logout',
  REFRESH_TOKEN: '/auth/refresh',

  // User endpoints
  GET_USER: '/users/profile',
  UPDATE_USER: '/users/profile',

  // Admin endpoints
  USER_MANAGEMENT: '/admin/users',
  GET_USERS: '/admin/users',
  CREATE_USER: '/admin/users',
  UPDATE_USER_ADMIN: '/admin/users/:id',
  DELETE_USER: '/admin/users/:id',

  // Teacher endpoints
  ATTENDANCE: '/teacher/attendance',
  CLASS_MANAGEMENT: '/teacher/classes',
  STUDENT_GRADES: '/teacher/grades',

  // Student endpoints
  MY_GRADES: '/student/grades',
};
