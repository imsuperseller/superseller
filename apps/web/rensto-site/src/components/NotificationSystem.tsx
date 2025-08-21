
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  persistent?: boolean;
  timestamp: number;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onNotificationVanish: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onNotificationVanish,
  position = 'top-right',
  maxNotifications = 5
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications.slice(-maxNotifications));
  }, [notifications, maxNotifications]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'top-center': return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center': return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default: return 'top-4 right-4';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return '#1eaef7';
      case 'success': return '#00ff00';
      case 'warning': return '#ffa500';
      case 'error': return '#fe3d51';
      default: return '#1eaef7';
    }
  };

  return (
    <div className={`notification-container fixed z-50 ${getPositionClasses()}`}>
      <AnimatePresence>
        {visibleNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            className="notification-item"
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              duration: 0.5, 
              ease: 'easeOut',
              delay: index * 0.1 
            }}
            style={{
              borderLeftColor: getNotificationColor(notification.type),
              borderLeftWidth: '4px'
            }}
          >
            <div className="notification-header">
              <span className="notification-icon">
                {getNotificationIcon(notification.type)}
              </span>
              <h4 className="notification-title">{notification.title}</h4>
              <button
                onClick={() => onNotificationVanish(notification.id)}
                className="notification-close"
              >
                ✕
              </button>
            </div>
            
            <p className="notification-message">{notification.message}</p>
            
            {!notification.persistent && (
              <div 
                className="notification-progress"
                style={{ backgroundColor: getNotificationColor(notification.type) }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing notifications
export const useNotificationManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    title: string, 
    message: string, 
    type: Notification['type'] = 'info',
    duration?: number,
    persistent = false
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      duration,
      persistent,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove non-persistent notifications
    if (!persistent && duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addSuccessNotification = useCallback((title: string, message: string, duration = 3000) => {
    addNotification(title, message, 'success', duration);
  }, [addNotification]);

  const addErrorNotification = useCallback((title: string, message: string, duration = 5000) => {
    addNotification(title, message, 'error', duration);
  }, [addNotification]);

  const addWarningNotification = useCallback((title: string, message: string, duration = 4000) => {
    addNotification(title, message, 'warning', duration);
  }, [addNotification]);

  const addInfoNotification = useCallback((title: string, message: string, duration = 3000) => {
    addNotification(title, message, 'info', duration);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    addSuccessNotification,
    addErrorNotification,
    addWarningNotification,
    addInfoNotification
  };
};

// Customer app specific notifications
export const CustomerAppNotifications = () => {
  const { 
    notifications, 
    removeNotification, 
    addSuccessNotification,
    addErrorNotification,
    addWarningNotification,
    addInfoNotification
  } = useNotificationManager();

  // Example: Auto-add notifications based on customer actions
  useEffect(() => {
    // Simulate customer action notifications
    const interval = setInterval(() => {
      const notificationTypes = [
        () => addSuccessNotification('המשימה הושלמה!', 'המשימה הושלמה בהצלחה'),
        () => addInfoNotification('עדכון נתונים', 'הנתונים עודכנו במערכת'),
        () => addWarningNotification('תזכורת', 'יש לך משימות ממתינות'),
        () => addErrorNotification('שגיאה', 'אירעה שגיאה בעיבוד הבקשה')
      ];

      const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      randomNotification();
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [addSuccessNotification, addErrorNotification, addWarningNotification, addInfoNotification]);

  return (
    <NotificationSystem
      notifications={notifications}
      onNotificationVanish={removeNotification}
      position="top-right"
      maxNotifications={3}
    />
  );
};
