import { API_ENDPOINTS } from '../constants';
import api from './apiClient';

const normalizeUserType = (userType) => {
  const normalized = String(userType || '').trim().toLowerCase();
  if (!normalized) return '';
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
};

const buildSignupPayload = (userData = {}) => {
  const payload = {
    firstName: String(userData.firstName || '').trim(),
    lastName: String(userData.lastName || '').trim(),
    userType: normalizeUserType(userData.userType),
    email: String(userData.email || '').trim(),
    password: userData.password,
  };

  const phone = String(userData.phone || '').trim();
  const address = String(userData.address || '').trim();
  const classId = String(userData.classId || '').trim();

  if (phone) payload.phone = phone;
  if (userData.dob) payload.dob = userData.dob;
  if (address) payload.address = address;
  if (classId) payload.classId = classId;

  return payload;
};

export const LoginUser = async (email, password) => {
  try {
    const response = await api.post(API_ENDPOINTS.LOGIN, {
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
    const response = await api.post(API_ENDPOINTS.SIGNUP, buildSignupPayload(userData));
    return response.data; // { message: 'Verification email sent' }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Signup failed';
    const err = new Error(errorMessage);
    err.status = error.response?.status;
    err.data = error.response?.data;
    throw err;
  }
};

export const VerifyEmail = async (token) => {
  try {
    const response = await api.post(API_ENDPOINTS.VERIFY_EMAIL, { token });
    return response.data; // { message: 'Email verified successfully' }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Verification failed';
    const err = new Error(errorMessage);
    err.status = error.response?.status;
    err.data = error.response?.data;
    throw err;
  }
};

export const ResendVerification = async (email) => {
  try {
    const response = await api.post(API_ENDPOINTS.RESEND_VERIFICATION, { email });
    return response.data; // { message: 'Verification email sent' }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to resend verification';
    const err = new Error(errorMessage);
    err.status = error.response?.status;
    err.data = error.response?.data;
    throw err;
  }
};
