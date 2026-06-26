import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const assetUrl = (path) => {
  if (!path) return '';
  return `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
};

export const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getErrorMessage = (error) => error?.response?.data?.message || error?.message || '';

export const isAuthError = (error) => {
  const message = getErrorMessage(error);
  return [
    'Unauthorized: Missing token!',
    'Unauthorized: Ivalid Token format',
    'Unauthorized: Invalid Token format',
    'Forbidden: Ivalid Token',
    'Forbidden: Invalid Token',
  ].includes(message);
};
