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

const isRoleRestrictedError = (error) => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    ''
  ).toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    message.includes('only teachers and admins') ||
    message.includes('access denied')
  );
};

const getNotificationsFromEndpoint = async (endpoint, params = {}) => {
  const response = await axios.get(
    `${API_BASE_URL}${endpoint}`,
    {
      params,
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

const getNotificationDetailFromEndpoint = async (endpoint) => {
  const response = await axios.get(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

export const GetNotifications = async (params = {}) => {
  try {
    return await getNotificationsFromEndpoint(API_ENDPOINTS.GET_NOTIFICATIONS, params);
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch notifications');
  }
};

export const AllNotifications = GetNotifications;

export const GetMyNotifications = async (params = {}) => {
  const primaryParams = { ...params };
  const fallbackParams = { ...params };
  delete fallbackParams.recipientEmail;

  let primaryError;

  try {
    return await getNotificationsFromEndpoint(API_ENDPOINTS.GET_NOTIFICATIONS, primaryParams);
  } catch (error) {
    if (!isRoleRestrictedError(error)) {
      throw handleApiError(error, 'Failed to fetch notifications');
    }
    primaryError = error;
  }

  const fallbackEndpoints = [
    API_ENDPOINTS.MY_NOTIFICATIONS,
    '/notifications/my',
    '/notifications/me',
  ];

  for (const endpoint of fallbackEndpoints) {
    if (!endpoint) {
      continue;
    }

    try {
      return await getNotificationsFromEndpoint(endpoint, fallbackParams);
    } catch (error) {
      if (error?.response?.status === 404) {
        continue;
      }

      throw handleApiError(error, 'Failed to fetch notifications');
    }
  }

  throw handleApiError(primaryError, 'Failed to fetch notifications');
};

export const GetNotificationById = async (notificationId) => {
  if (!notificationId) {
    throw new Error('Notification ID is required');
  }

  const primaryEndpoint = API_ENDPOINTS.GET_NOTIFICATION_BY_ID.replace(':notificationId', notificationId);

  try {
    return await getNotificationDetailFromEndpoint(primaryEndpoint);
  } catch (error) {
    if (!isRoleRestrictedError(error)) {
      throw handleApiError(error, 'Failed to fetch notification details');
    }

    const fallbackEndpoints = [
      API_ENDPOINTS.GET_MY_NOTIFICATION_BY_ID.replace(':notificationId', notificationId),
      `/notifications/my/${notificationId}`,
      `/notifications/me/${notificationId}`,
    ];

    for (const endpoint of fallbackEndpoints) {
      try {
        return await getNotificationDetailFromEndpoint(endpoint);
      } catch (fallbackError) {
        if (fallbackError?.response?.status === 404) {
          continue;
        }

        throw handleApiError(fallbackError, 'Failed to fetch notification details');
      }
    }

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