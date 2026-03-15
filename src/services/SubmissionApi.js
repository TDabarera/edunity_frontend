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

const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) {
    throw new Error('Submission PDF URL was not provided by the server');
  }

  const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
  return new URL(fileUrl, `${apiOrigin}/`).toString();
};

const buildSubmissionPayload = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

const getMultipartHeaders = () => {
  return {
    ...getAuthHeader(),
    'Content-Type': 'multipart/form-data',
  };
};

export const SubmitAssignment = async (assignmentId, file) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.SUBMIT_ASSIGNMENT}`.replace(':id', assignmentId),
      buildSubmissionPayload(file),
      {
        headers: getMultipartHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to submit assignment');
  }
};

export const EditSubmission = async (assignmentId, file) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.EDIT_SUBMISSION}`.replace(':id', assignmentId),
      buildSubmissionPayload(file),
      {
        headers: getMultipartHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to edit submission');
  }
};

export const GetMySubmissions = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.MY_SUBMISSIONS}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { success: true, count, submissions: [] }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch submissions');
  }
};

export const DeleteSubmissionById = async (submissionId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}${API_ENDPOINTS.DELETE_SUBMISSION}`.replace(':submissionId', submissionId),
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { success: true, message: 'Submission deleted successfully!' }
  } catch (error) {
    throw handleApiError(error, 'Failed to delete submission');
  }
};

export const GetSubmissionPdfUrl = async (assignmentId, submissionId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.GET_SUBMISSION_PDF}`
        .replace(':assignmentId', assignmentId)
        .replace(':submissionId', submissionId),
      {
        headers: getAuthHeader(),
      }
    );

    return resolveFileUrl(response.data?.fileUrl);
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch submission PDF');
  }
};
