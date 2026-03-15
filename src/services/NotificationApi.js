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

export const GetNotifications = async (params = {}) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.GET_NOTIFICATIONS}`,
      {
        params,
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch notifications');
  }
};

export const AllNotifications = GetNotifications;

export const GetNotificationById = async (notificationId) => {
  if (!notificationId) {
    throw new Error('Notification ID is required');
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.GET_NOTIFICATION_BY_ID}`.replace(':notificationId', notificationId),
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch notification details');
  }
};

export const ResendNotificationById = async (notificationId) => {
  if (!notificationId) {
    throw new Error('Notification ID is required');
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.RESEND_NOTIFICATION}`.replace(':notificationId', notificationId),
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to resend notification');
  }
};