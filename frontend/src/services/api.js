import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ============ PROPERTIES ============
export const propertiesAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  getMyProperties: (params) => api.get('/properties/my/properties', { params }),
  getStats: (id) => api.get(`/properties/${id}/stats`),
};

// ============ UNITS ============
export const unitsAPI = {
  getAll: (params) => api.get('/units', { params }),
  getById: (id) => api.get(`/units/${id}`),
  create: (data) => api.post('/units', data),
  update: (id, data) => api.put(`/units/${id}`, data),
  delete: (id) => api.delete(`/units/${id}`),
  getByProperty: (propertyId, params) => api.get(`/units/property/${propertyId}`, { params }),
  getAvailable: (params) => api.get('/units/available/list', { params }),
};

// ============ APPLICATIONS ============
export const applicationsAPI = {
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdraw: (id) => api.put(`/applications/${id}/withdraw`),
  getMyApplications: (params) => api.get('/applications/my/applications', { params }),
};

// ============ LEASES ============
export const leasesAPI = {
  getAll: (params) => api.get('/leases', { params }),
  getById: (id) => api.get(`/leases/${id}`),
  create: (data) => api.post('/leases', data),
  update: (id, data) => api.put(`/leases/${id}`, data),
  terminate: (id) => api.put(`/leases/${id}/terminate`),
  renew: (id, data) => api.post(`/leases/${id}/renew`, data),
  getExpiring: (params) => api.get('/leases/expiring/soon', { params }),
  getMyLeases: (params) => api.get('/leases/my/leases', { params }),
};

// ============ PAYMENTS ============
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  getHistory: (params) => api.get('/payments/history', { params }),
  getMyPayments: (params) => api.get('/payments/my/payments', { params }),
  getReceipt: (id) => api.get(`/payments/${id}/receipt`),
};

// ============ MAINTENANCE ============
export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  updateStatus: (id, data) => api.put(`/maintenance/${id}/status`, data),
  assign: (id, data) => api.put(`/maintenance/${id}/assign`, data),
  getMyRequests: (params) => api.get('/maintenance/my/requests', { params }),
};

// ============ REPORTS ============
export const reportsAPI = {
  propertyAvailability: (params) => api.get('/reports/property-availability', { params }),
  rentCollection: (params) => api.get('/reports/rent-collection', { params }),
  leaseExpiry: (params) => api.get('/reports/lease-expiry', { params }),
  maintenance: (params) => api.get('/reports/maintenance', { params }),
};

// ============ USERS ============
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ============ DASHBOARD ============
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAdminStats: () => api.get('/dashboard/admin/stats'),
  getOwnerStats: () => api.get('/dashboard/owner/stats'),
  getTenantStats: () => api.get('/dashboard/tenant/stats'),
  getManagerStats: () => api.get('/dashboard/manager/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
};

export default api;
