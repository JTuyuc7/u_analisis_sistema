import axios from 'axios';
import { cookies } from '../utils/cookies';

const backendURL = process.env.NEXT_PUBLIC_API_URL || '';

const apiPublicClient = axios.create({
  baseURL: `${backendURL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiPrivateClient = axios.create({
  baseURL: `${backendURL}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiPrivateClient.interceptors.request.use((config) => {
  const { token } = cookies.get();
  if (token) {
    config.headers['Authorization'] = `${token}`;
  }
  return config;
});

export { apiPrivateClient, apiPublicClient };