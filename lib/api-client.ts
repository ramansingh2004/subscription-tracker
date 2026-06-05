import axios, { AxiosInstance, AxiosError } from 'axios';

// Properly construct the API base URL
const getBaseURL = () => {
  // If in the browser, default to relative path '/api'.
  // This works dynamically across any domain (local, preview, production)
  // without needing to define env variables in Vercel.
  if (typeof window !== 'undefined') {
    // If NEXT_PUBLIC_API_URL is configured, only use it if it doesn't conflict
    // (e.g. env points to localhost but page is on a remote domain).
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      const isLocalhostEnv = envUrl.includes('localhost') || envUrl.includes('127.0.0.1');
      const isLocalhostPage = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (!isLocalhostEnv || isLocalhostPage) {
        return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
      }
    }
    return '/api';
  }

  // Server-side fallback (e.g., during build or server pre-rendering)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }

  return 'http://localhost:3000/api';
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API Client Base URL:', apiClient.defaults.baseURL);

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  console.log(`[API Client Request] ${config.method?.toUpperCase()} ${config.url} | Has Token: ${!!token}`);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Client Response Success] ${response.config.method?.toUpperCase()} ${response.config.url} | Status: ${response.status}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const status = error.response?.status;
    console.log(`[API Client Response Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} | Status: ${status} | Message: ${error.message}`);

    // Do not attempt token refresh for authentication routes
    const isAuthRequest = originalRequest?.url && (
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/signup') ||
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/refresh')
    );

    if (status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      console.log(`[API Client] Token expired/rejected for ${originalRequest.url}. Attempting silent token refresh...`);
      try {
        const refreshRes = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshRes.data.data.accessToken;
        console.log(`[API Client] Token refresh successful. Saving new token and retrying original request...`);
        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.error(`[API Client] Token refresh failed:`, refreshError.message);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;