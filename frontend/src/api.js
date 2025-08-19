import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Your Django backend API base URL
});

// Request interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authTokens');
  if (token) {
    const parsedToken = JSON.parse(token);
    config.headers.Authorization = `Bearer ${parsedToken.access}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const token = JSON.parse(localStorage.getItem('authTokens'));
        const response = await axios.post('http://127.0.0.1:8000/auth/api/token/refresh/', {
          refresh: token.refresh
        });
        
        const newTokens = response.data;
        localStorage.setItem('authTokens', JSON.stringify(newTokens));
        
        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (err) {
        console.error('Token refresh failed:', err);
        // Handle refresh failure (e.g., redirect to login)
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

// Landlord dashboard API
export const getLandlordDashboardData = async () => {
  try {
    const response = await api.get('/auth/landlord');
    return response.data;
  } catch (error) {
    console.error('Error fetching landlord dashboard data:', error);
    throw error;
  }
};

// Tenant dashboard API
export const getTenantDashboardData = async () => {
  try {
    const response = await api.get('/auth/tenant_data');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenant dashboard data:', error);
    throw error;
  }
};

export default api;
