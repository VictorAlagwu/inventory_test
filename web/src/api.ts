import axios from 'axios';

export const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API ?? 'http://localhost:3001/api/v1',
  headers: {
    'content-type': 'application/json',
  }
});
