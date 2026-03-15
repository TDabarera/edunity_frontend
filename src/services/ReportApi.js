import api from './apiClient';
import { API_ENDPOINTS } from '../constants';

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

export const GetMyChildrenAttendanceStatus = async (params = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_MY_CHILDREN_ATTENDANCE_STATUS, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch children attendance status');
  }
};

export const GetTeacherAssignmentSummary = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_TEACHER_ASSIGNMENT_SUMMARY, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch teacher assignment summary');
  }
};

export const GetSimpleDashboardReport = async (params = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_SIMPLE_DASHBOARD_REPORT, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch dashboard report');
  }
};
