import { api } from './authService';

const adminService = {
  async getStats() {
    const res = await api.get('/api/v1/admin/stats');
    return res.data;
  },

  async getAnalytics() {
    const res = await api.get('/api/v1/admin/analytics');
    return res.data;
  },

  async getDepartments() {
    const res = await api.get('/api/v1/admin/departments');
    return res.data.departments || [];
  },

  async listActivities(params) {
    // Filter out empty string parameters to avoid 422 errors
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );
    const res = await api.get('/api/v1/admin/all-activities', { params: cleanParams });
    return res.data;
  },

  async approveActivity(activityId, comments) {
    const res = await api.post(`/api/v1/admin/approve/${activityId}`, comments ? { comments } : {});
    return res.data;
  },

  async rejectActivity(activityId, comments) {
    const res = await api.post(`/api/v1/admin/activities/${activityId}/reject`, comments ? { comments } : {});
    return res.data;
  },

  async verifyImage(activityId, imageIndex, verdict) {
    const res = await api.post(`/api/v1/admin/activities/${activityId}/verify-image`, {
      image_index: imageIndex,
      verdict: verdict
    });
    return res.data;
  },

  async listUsers(params) {
    // Filter out empty string parameters to avoid 422 errors
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );
    const res = await api.get('/api/v1/admin/users/all', { params: cleanParams });
    return res.data;
  },

  async toggleUserStatus(userId) {
    const res = await api.post(`/api/v1/admin/users/${userId}/toggle-status`);
    return res.data;
  },

  async updateUser(userId, userData) {
    const res = await api.put(`/api/v1/users/${userId}`, userData);
    return res.data;
  },

  async createActivity(activityData) {
    const res = await api.post('/api/v1/admin/activities/create', activityData);
    return res.data;
  },

  // Notification Management
  async getNotifications(params = {}) {
    // Filter out empty string parameters to avoid 422 errors
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );
    const res = await api.get('/api/v1/admin/notifications', { params: cleanParams });
    return res.data;
  },

  async getNotificationStats() {
    const res = await api.get('/api/v1/admin/notifications/stats');
    return res.data;
  },

  async createNotification(data) {
    const res = await api.post('/api/v1/admin/notifications/create', data);
    return res.data;
  },

  async updateNotification(notificationId, data) {
    const res = await api.put(`/api/v1/admin/notifications/${notificationId}`, data);
    return res.data;
  },

  async deleteNotification(notificationId) {
    const res = await api.delete(`/api/v1/admin/notifications/${notificationId}`);
    return res.data;
  },

  async markNotificationsRead(notificationIds) {
    const res = await api.post('/api/v1/admin/notifications/bulk-read', notificationIds);
    return res.data;
  },

  async bulkDeleteNotifications(notificationIds) {
    const res = await api.post('/api/v1/admin/notifications/bulk-delete', notificationIds);
    return res.data;
  }
};

export default adminService;


