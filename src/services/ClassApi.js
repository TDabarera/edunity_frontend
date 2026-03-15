import { API_ENDPOINTS } from '../constants';
import api from './apiClient';

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

export const GetAllClasses = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_ALL_CLASSES, {
      headers: getAuthHeader(),
    });
    return response.data; // { status, data: [] }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch classes');
  }
};

export const GetClassById = async (classId) => {
  try {
    const response = await api.get(
      API_ENDPOINTS.GET_CLASS_BY_ID.replace(':id', classId),
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { status, data }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch class');
  }
};

export const CreateClass = async (classData) => {
  try {
    const response = await api.post(
      API_ENDPOINTS.CREATE_CLASS,
      classData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { status, message, data }
  } catch (error) {
    throw handleApiError(error, 'Failed to create class');
  }
};

export const UpdateClass = async (classId, classData) => {
  try {
    const response = await api.put(
      API_ENDPOINTS.UPDATE_CLASS.replace(':id', classId),
      classData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { status, message, data }
  } catch (error) {
    throw handleApiError(error, 'Failed to update class');
  }
};

export const DeleteClass = async (classId) => {
  try {
    const response = await api.delete(
      API_ENDPOINTS.DELETE_CLASS.replace(':id', classId),
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { status, message }
  } catch (error) {
    throw handleApiError(error, 'Failed to delete class');
  }
};
