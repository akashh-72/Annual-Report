import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/authService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadNotifications = useCallback(async () => {
    if (!user) {
      console.log('[NotificationContext] No user, skipping notification load');
      return;
    }

    setLoading(true);
    try {
      console.log('[NotificationContext] Loading notifications for user:', user.id);
      const response = await api.get('/api/v1/notifications');
      console.log('[NotificationContext] Notifications response:', response.data);
      
      const notificationsList = response.data?.notifications || [];
      const unread = response.data?.unread_count || 0;
      
      console.log('[NotificationContext] Setting notifications:', notificationsList.length, 'Unread:', unread);
      
      setNotifications(notificationsList);
      setUnreadCount(unread);
    } catch (error) {
      console.error('[NotificationContext] Error loading notifications:', error);
      console.error('[NotificationContext] Error response:', error.response?.data);
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, loadNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/v1/notifications/${notificationId}/read`).catch(() => {});
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/v1/notifications/read-all').catch(() => {});
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/v1/notifications/${notificationId}`).catch(() => {});
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      // Update unread count if the deleted notification was unread
      const deletedNotif = notifications.find(notif => notif.id === notificationId);
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'activity_approved':
        return '✅';
      case 'error':
      case 'activity_rejected':
      case 'activity_discarded':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
      case 'activity_approved':
        return 'text-green-600';
      case 'error':
      case 'activity_rejected':
      case 'activity_discarded':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    getNotificationIcon,
    getNotificationColor
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
