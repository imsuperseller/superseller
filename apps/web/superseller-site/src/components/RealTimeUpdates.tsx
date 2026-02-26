
import React, { useState, useEffect, useCallback } from 'react';
import { AutoVanishing, RealTimeUpdate } from './AutoVanishing';

interface Update {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  duration?: number;
}

interface RealTimeUpdateManagerProps {
  updates: Update[];
  onUpdateVanish: (id: string) => void;
  maxUpdates?: number;
}

export const RealTimeUpdateManager: React.FC<RealTimeUpdateManagerProps> = ({
  updates,
  onUpdateVanish,
  maxUpdates = 5
}) => {
  const [visibleUpdates, setVisibleUpdates] = useState<Update[]>([]);

  useEffect(() => {
    setVisibleUpdates(updates.slice(-maxUpdates));
  }, [updates, maxUpdates]);

  const handleUpdateVanish = useCallback((id: string) => {
    setVisibleUpdates(prev => prev.filter(update => update.id !== id));
    onUpdateVanish(id);
  }, [onUpdateVanish]);

  return (
    <div className="real-time-updates-container">
      <AnimatePresence>
        {visibleUpdates.map((update) => (
          <RealTimeUpdate
            key={update.id}
            message={update.message}
            type={update.type}
            duration={update.duration || 5000}
            onVanish={() => handleUpdateVanish(update.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing real-time updates
export const useRealTimeUpdates = () => {
  const [updates, setUpdates] = useState<Update[]>([]);

  const addUpdate = useCallback((message: string, type: Update['type'] = 'info', duration?: number) => {
    const newUpdate: Update = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now(),
      duration
    };

    setUpdates(prev => [...prev, newUpdate]);
  }, []);

  const removeUpdate = useCallback((id: string) => {
    setUpdates(prev => prev.filter(update => update.id !== id));
  }, []);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    updates,
    addUpdate,
    removeUpdate,
    clearUpdates
  };
};

// Customer app specific real-time updates
export const CustomerAppUpdates = () => {
  const { updates, addUpdate, removeUpdate } = useRealTimeUpdates();

  // Example: Auto-add updates based on customer actions
  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const updateTypes = ['info', 'success', 'warning'] as const;
      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      
      const messages = {
        info: ['מעדכן נתונים...', 'בודק סטטוס...', 'מעבד בקשה...'],
        success: ['המשימה הושלמה!', 'הנתונים עודכנו!', 'הפעולה הצליחה!'],
        warning: ['יש בעיה קלה...', 'נדרש אישור נוסף...', 'מעבד בקשה...']
      };

      const randomMessage = messages[randomType][Math.floor(Math.random() * messages[randomType].length)];
      addUpdate(randomMessage, randomType);
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [addUpdate]);

  return (
    <RealTimeUpdateManager
      updates={updates}
      onUpdateVanish={removeUpdate}
      maxUpdates={3}
    />
  );
};
