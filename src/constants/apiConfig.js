export const API_BASE_URL ='http://localhost:5000/api/v1';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/login',
  SIGNUP: '/users/createuser',
  LOGOUT: '/logout',
  REFRESH_TOKEN: '/auth/refresh',

  // User endpoints
  GET_USER: '/users/profile',
  UPDATE_USER: '/users/profile',
  GET_USER_BY_ID: '/users/:id',
  UPDATE_USER_BY_ID: '/users/:id',

  // Admin endpoints
  USER_MANAGEMENT: '/admin/users',
  GET_USERS: '/users',
  CREATE_USER: '/users/createuser',
  UPDATE_USER_ADMIN: '/users/:id',
  DELETE_USER: '/users/:id',

  // Teacher endpoints
  ATTENDANCE: '/teacher/attendance',
  CLASS_MANAGEMENT: '/teacher/classes',
  STUDENT_GRADES: '/teacher/grades',

  // Class endpoints
  GET_ALL_CLASSES: '/class',
  CREATE_CLASS: '/class',
  GET_CLASS_BY_ID: '/class/:id',
  UPDATE_CLASS: '/class/:id',
  DELETE_CLASS: '/class/:id',

  // Student endpoints
  MY_GRADES: '/student/grades',
};
