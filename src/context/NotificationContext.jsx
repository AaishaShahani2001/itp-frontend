import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppContext } from './AppContext';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { axios, backendUrl, token } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 10) => {
    if (!token) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.get(`${backendUrl}/api/user/notifications`, {
        params: { page, limit },
        headers: { token }
      });
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${backendUrl}/api/user/notifications/unread-count`, {
        headers: { token }
      });
      
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await axios.put(`${backendUrl}/api/user/notifications/${notificationId}/read`, {}, {
        headers: { token }
      });
      
      if (response.data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      // Handle error silently
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      const response = await axios.put(`${backendUrl}/api/user/notifications/mark-all-read`, {}, {
        headers: { token }
      });
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await axios.delete(`${backendUrl}/api/user/notifications/${notificationId}`, {
        headers: { token }
      });
      
      if (response.data.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        // Update unread count if the deleted notification was unread
        const deletedNotif = notifications.find(notif => notif._id === notificationId);
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      // Handle error silently
    }
  };

  // Auto-fetch notifications and unread count when token changes
  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
