import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // HTTP-Only cookies send karne ke liye
  headers: {
    'Content-Type': 'application/json',
  },
});