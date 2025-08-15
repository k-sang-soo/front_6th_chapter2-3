import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === 'production' ? 'https://dummyjson.com' : '/api',
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
