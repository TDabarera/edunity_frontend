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
    throw new Error('Assignment PDF URL was not provided by the server');
  }

  const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
  return new URL(fileUrl, `${apiOrigin}/`).toString();
};

export const GetMyAssignments = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.MY_ASSIGNMENTS}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { success: true, count: 3, assignments: [...] }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch assignments');
  }
};

export const GetUploadedAssignments = async (userId) => {
  try {
    const payload = userId ? { userId } : {};
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.UPLOADED_ASSIGNMENTS}`,
      payload,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { success: true, count, assignments: [] }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch uploaded assignments');
  }
};

export const GetAssignmentById = async (assignmentId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.GET_ASSIGNMENT}`.replace(':id', assignmentId),
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch assignment');
  }
};

export const SearchAssignmentsByTitle = async (title) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.SEARCH_ASSIGNMENTS}`,
      {
        params: {
          title,
        },
        headers: getAuthHeader(),
      }
    );
    return response.data; // { success: true, count: 2, searchTerm: 'Math', assignments: [...] }
  } catch (error) {
    throw handleApiError(error, 'Failed to search assignments');
  }
};

export const GetAllAssignments = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.GET_ALL_ASSIGNMENTS}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { success: true, count: 3, assignments: [...] }
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch all assignments');
  }
};

export const DeleteAssignment = async (assignmentId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}${API_ENDPOINTS.DELETE_ASSIGNMENT}`.replace(':id', assignmentId),
      {
        headers: getAuthHeader(),
      }
    );
    return response.data; // { success: true, message: 'Assignment deleted successfully!' }
  } catch (error) {
    throw handleApiError(error, 'Failed to delete assignment');
  }
};

export const GetAssignmentPdfUrl = async (assignmentId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.GET_ASSIGNMENT_PDF}`.replace(':assignmentId', assignmentId),
      {
        headers: getAuthHeader(),
      }
    );

    return resolveFileUrl(response.data?.fileUrl);
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch assignment PDF');
  }
};

export const ResolveAssignmentFileUrl = (fileUrl) => {
  return resolveFileUrl(fileUrl);
};

const buildAssignmentPayload = (payload, file) => {
  if (!file) {
    return payload;
  }

  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('deadline', payload.deadline);
  formData.append('assignedToClasses', JSON.stringify(payload.assignedToClasses));
  formData.append('file', file);

  return formData;
};

const buildAssignmentHeaders = (file) => {
  if (!file) {
    return getAuthHeader();
  }

  return {
    ...getAuthHeader(),
    'Content-Type': 'multipart/form-data',
  };
};

export const CreateAssignment = async (payload, file) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.CREATE_ASSIGNMENT}`,
      buildAssignmentPayload(payload, file),
      {
        headers: buildAssignmentHeaders(file),
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to create assignment');
  }
};

export const UpdateAssignment = async (assignmentId, payload, file) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}${API_ENDPOINTS.UPDATE_ASSIGNMENT}`.replace(':assignmentId', assignmentId),
      buildAssignmentPayload(payload, file),
      {
        headers: buildAssignmentHeaders(file),
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Failed to update assignment');
  }
};
