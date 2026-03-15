const LOCAL_API_BASE_URL = 'http://localhost:5000/api/v1';
const PRODUCTION_API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim();

export const API_BASE_URL = import.meta.env.DEV
  ? LOCAL_API_BASE_URL
  : PRODUCTION_API_BASE_URL;

if (import.meta.env.PROD && !API_BASE_URL) {
  throw new Error('Missing VITE_API_URL for production build. Set it in your deployment environment variables.');
}
export const API_URL = API_BASE_URL;

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/login',
  SIGNUP: '/users/signup',
  VERIFY_EMAIL: '/verify-email',
  RESEND_VERIFICATION: '/resend-verification',
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
  GET_PENDING_USERS: '/users/pending',
  CREATE_USER: '/users/createuser',
  UPDATE_USER_ADMIN: '/users/:id',
  DELETE_USER: '/users/:id',

  // Teacher endpoints
  ATTENDANCE: '/teacher/attendance',
  CLASS_MANAGEMENT: '/teacher/classes',
  STUDENT_GRADES: '/teacher/grades',

  // Attendance endpoints
  GET_ATTENDANCE: '/attendance',
  GET_ATTENDANCE_BY_ID: '/attendance/:id',
  GET_ATTENDANCE_BY_CLASS: '/attendance/class/:classId',
  CREATE_ATTENDANCE: '/attendance/mark',
  UPDATE_ATTENDANCE: '/attendance/:id',
  DELETE_ATTENDANCE: '/attendance/:id',
  GET_ATTENDANCE_STATS: '/attendance/stats',

  // Class endpoints
  GET_ALL_CLASSES: '/class',
  CREATE_CLASS: '/class',
  GET_CLASS_BY_ID: '/class/:id',
  UPDATE_CLASS: '/class/:id',
  DELETE_CLASS: '/class/:id',

  // Student endpoints
  MY_GRADES: '/student/grades',

  // Assignment endpoints
  MY_ASSIGNMENTS: '/assignments/my-assignments/assigned',
  UPLOADED_ASSIGNMENTS: '/assignments/uploaded-by-me',
  GET_ASSIGNMENT: '/assignments/:id',
  SEARCH_ASSIGNMENTS: '/assignments/search/by-title',
  GET_ALL_ASSIGNMENTS: '/assignments/all',
  DELETE_ASSIGNMENT: '/assignments/:id',
  GET_ASSIGNMENT_PDF: '/assignments/:assignmentId/pdf',
  CREATE_ASSIGNMENT: '/assignments/upload',
  UPDATE_ASSIGNMENT: '/assignments/:assignmentId/edit',

  // Submission endpoints
  SUBMIT_ASSIGNMENT: '/submissions/:id/submit',
  EDIT_SUBMISSION: '/submissions/:id/edit-submission',
  MY_SUBMISSIONS: '/submissions/my-submissions',
  GET_ASSIGNMENT_SUBMISSIONS: '/submissions/:assignmentId/submissions',
  DELETE_SUBMISSION: '/submissions/:submissionId',
  GET_SUBMISSION_PDF: '/submissions/:assignmentId/submission/:submissionId/pdf',

  // Notification endpoints
  GET_NOTIFICATIONS: '/notifications',
  MY_NOTIFICATIONS: '/notifications/my-notifications',
  GET_NOTIFICATION_BY_ID: '/notifications/:notificationId',
  GET_MY_NOTIFICATION_BY_ID: '/notifications/my-notifications/:notificationId',
  RESEND_NOTIFICATION: '/notifications/:notificationId/resend',
};
