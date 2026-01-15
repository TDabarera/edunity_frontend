import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      email,
      password,
    });
    return response.data; // { token, user }
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const signupUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`, userData);
    return response.data; // { token, user }
  } catch (error) {
    throw error.response?.data || { message: 'Signup failed' };
  }
};