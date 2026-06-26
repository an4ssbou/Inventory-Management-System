import { jwtDecode } from 'jwt-decode';

export const getToken = () => localStorage.getItem('token');

export const clearToken = () => localStorage.removeItem('token');

export const decodeToken = (token = getToken()) => {
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    clearToken();
    return null;
  }
};
