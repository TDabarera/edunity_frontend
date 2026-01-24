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

export const GetUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GET_USERS}`, {
      headers: getAuthHeader(),
    });
    return response.data; // { users: [] }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch users');
  }
};

export const GetAllUsers = GetUsers;

export const CreateUser = async (userData) => {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.CREATE_USER}`;
    const response = await axios.post(url, userData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('[UserApi] CreateUser error URL:', `${API_BASE_URL}${API_ENDPOINTS.CREATE_USER}`);
    throw handleApiError(error, 'Failed to create user');
  }
};

export const UpdateUser = async (userId, userData) => {
  try {
    const endpoint = API_ENDPOINTS.UPDATE_USER_ADMIN.replace(':id', userId);
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await axios.put(
      url,
      userData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    const endpoint = API_ENDPOINTS.UPDATE_USER_ADMIN.replace(':id', userId);
    console.error('[UserApi] UpdateUser error URL:', `${API_BASE_URL}${endpoint}`);
    throw handleApiError(error, 'Failed to update user');
  }
};

export const GetUserById = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.GET_USER_BY_ID.replace(':id', userId)}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { status, user }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch user');
  }
};

export const UpdateUserById = async (userId, userData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.UPDATE_USER_BY_ID.replace(':id', userId)}`,
      userData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { status, user }
  } catch (error) {
    throw handleApiError(error, 'Failed to update user');
  }
};

export const DeleteUser = async (userId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}${API_ENDPOINTS.DELETE_USER.replace(':id', userId)}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to delete user');
  }
};
