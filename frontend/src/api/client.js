import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL,
  timeout: 60000, // 60s timeout
  headers: {
    'Accept': 'application/json',
  },
});

export default apiClient;
