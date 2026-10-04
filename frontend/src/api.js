// Centralized API client

const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async signup(data) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updatePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/update-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return res.json();
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/users?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminUserDetails(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async addAdminUser(data) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAdminStores(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/stores?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async addAdminStore(data) {
    const res = await fetch(`${API_BASE}/admin/stores`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Stores & Normal User
  async getStores(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/stores?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async submitRating(storeId, rating) {
    const res = await fetch(`${API_BASE}/stores/${storeId}/rating`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating }),
    });
    return res.json();
  },

  // Store Owner
  async getStoreOwnerDashboard(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/store-owner/dashboard?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
