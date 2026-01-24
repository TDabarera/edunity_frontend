import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';

const getAuthToken = () => {
  return localStorage.getItem('edunity_token');
};

const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleApiError = (error, defaultMessage) => {
  const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || defaultMessage;
  const err = new Error(errorMessage);
  err.status = error.response?.status;
  err.data = error.response?.data;
  return err;
};

/**
 * Get attendance records with optional filters
 * @param {Object} params - Query parameters (date, classId, studentId, teacherId)
 * @returns {Promise<Object>} Response with attendance records
 */
export const GetAttendanceRecords = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${API_ENDPOINTS.GET_ATTENDANCE}${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });
    return response.data; // { status, records: [] }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch attendance records');
  }
};

/**
 * Get attendance record by ID
 * @param {string} recordId - The attendance record ID
 * @returns {Promise<Object>} Response with attendance record details
 */
export const GetAttendanceById = async (recordId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.GET_ATTENDANCE_BY_ID.replace(':id', recordId)}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { status, record }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch attendance record');
  }
};

/**
 * Get all attendance records for a specific class
 * @param {string} classId - The class ID
 * @returns {Promise<Object>} Response with attendance records for the class
 */
export const GetAttendanceByClass = async (classId) => {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.GET_ATTENDANCE_BY_CLASS.replace(':classId', classId)}`;
    
    console.log('[DEBUG GetAttendanceByClass] Full URL:', url);
    console.log('[DEBUG GetAttendanceByClass] ClassId param:', classId);
    
    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });
    
    console.log('[DEBUG GetAttendanceByClass] Response data:', response.data);
    console.log('[DEBUG GetAttendanceByClass] Sample record classId:', response.data.attendance?.[0]?.className);
    
    return response.data; // { status, count, attendance: [] }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch attendance records for class');
  }
};

/**
 * Create new attendance record(s)
 * @param {Object} data - Attendance data { records: [] } or single record
 * @returns {Promise<Object>} Response with created records
 */
export const CreateAttendanceRecord = async (data) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.CREATE_ATTENDANCE}`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { status, records or record }
  } catch (error) {
    throw handleApiError(error, 'Failed to create attendance record');
  }
};

/**
 * Update an attendance record
 * @param {string} recordId - The attendance record ID
 * @param {Object} data - Updated attendance data
 * @returns {Promise<Object>} Response with updated record
 */
export const UpdateAttendanceRecord = async (recordId, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.UPDATE_ATTENDANCE.replace(':id', recordId)}`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { status, record }
  } catch (error) {
    throw handleApiError(error, 'Failed to update attendance record');
  }
};

/**
 * Delete an attendance record
 * @param {string} recordId - The attendance record ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export const DeleteAttendanceRecord = async (recordId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}${API_ENDPOINTS.DELETE_ATTENDANCE.replace(':id', recordId)}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { status, message }
  } catch (error) {
    throw handleApiError(error, 'Failed to delete attendance record');
  }
};

/**
 * Get attendance statistics for a class or student
 * @param {Object} params - Query parameters (classId, studentId, startDate, endDate)
 * @returns {Promise<Object>} Response with attendance statistics
 */
export const GetAttendanceStats = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${API_ENDPOINTS.GET_ATTENDANCE_STATS}${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });
    return response.data; // { status, stats }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch attendance statistics');
  }
};
