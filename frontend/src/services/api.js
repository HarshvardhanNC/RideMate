// API service for RideMate backend integration
// Use proxy for API calls to avoid CORS issues
const API_BASE_URL = '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    console.log('🌐 API Request:', { 
      url, 
      method: options.method || 'GET',
      hasAuth: !!this.token 
    });

    try {
      const response = await fetch(url, config);
      console.log('📡 API Response:', { 
        status: response.status, 
        ok: response.ok,
        statusText: response.statusText 
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Invalid content type:', contentType);
        throw new Error('Invalid response format from server');
      }

      const data = await response.json();
      console.log('📦 API Data:', data);

      if (!response.ok) {
        console.error('❌ API Error Response:', data);
        throw new Error(data.message || `API request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API Error:', {
        message: error.message,
        endpoint,
        url
      });
      throw error;
    }
  }

  // Authentication API
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
  }

  // Rides API
  async getRides(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/rides?${queryString}` : '/rides';
    return this.request(endpoint);
  }

  async getRideById(id) {
    return this.request(`/rides/${id}`);
  }

  async createRide(rideData) {
    return this.request('/rides', {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
  }

  async updateRide(id, rideData) {
    return this.request(`/rides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rideData),
    });
  }

  async deleteRide(id) {
    return this.request(`/rides/${id}`, {
      method: 'DELETE',
    });
  }

  async joinRide(id) {
    return this.request(`/rides/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveRide(id) {
    return this.request(`/rides/${id}/leave`, {
      method: 'POST',
    });
  }

  async getUserRides(userId, type = 'posted') {
    return this.request(`/rides/user/${userId}?type=${type}`);
  }

  // Users API
  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserStats(id) {
    return this.request(`/users/${id}/stats`);
  }

  async getUsersByCollege(college) {
    return this.request(`/users/college/${college}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
