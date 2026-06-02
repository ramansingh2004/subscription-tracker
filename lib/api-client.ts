import axios, { AxiosInstance, AxiosError } from 'axios';

// Properly construct the API base URL
const getBaseURL = () => {
  const appUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Ensure /api is appended
  return appUrl.endsWith('/api') ? appUrl : `${appUrl}/api`;
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