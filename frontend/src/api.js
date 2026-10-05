// Centralized API client with automatic token attachment, session persistence, and security handling

const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  try {
    const data = await res.json();
    if (res.status === 401) {
      // If token expired or revoked, clear stale session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return data;
  } catch (err) {
    return { success: false, message: 'Invalid response from server' };
  }
};

export const api = {
  // Auth
  async login(email, password, rememberDuration = '1825d') {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberDuration }),
    });
    return handleResponse(res);
  },

  async signup(data) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updatePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/update-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await handleResponse(res);
    // If backend provided refreshed token, save it so active session remains uninterrupted
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/users?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminUserDetails(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async addAdminUser(data) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getAdminStores(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/stores?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async addAdminStore(data) {
    const res = await fetch(`${API_BASE}/admin/stores`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Stores & Normal User
  async getStores(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/stores?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async submitRating(storeId, rating) {
    const res = await fetch(`${API_BASE}/stores/${storeId}/rating`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating }),
    });
    return handleResponse(res);
  },

  // Store Owner
  async getStoreOwnerDashboard(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/store-owner/dashboard?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
