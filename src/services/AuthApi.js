import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';

export const LoginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      email,
      password,
    });
    return response.data; // { token, user }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed';
    const err = new Error(errorMessage);
    err.status = error.response?.status;
    err.data = error.response?.data;
    throw err;
  }
};

export const SignupUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`, userData);
    return response.data; // { token, user }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Signup failed';
    const err = new Error(errorMessage);
    err.status = error.response?.status;
    err.data = error.response?.data;
    throw err;
  }
};
