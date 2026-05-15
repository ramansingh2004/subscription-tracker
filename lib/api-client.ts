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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = refreshRes.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;