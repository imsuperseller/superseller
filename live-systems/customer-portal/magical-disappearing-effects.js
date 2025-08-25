#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';

/**
 * ✨ MAGICAL DISAPPEARING EFFECTS - CUSTOMER APP
 * 
 * This script creates magical disappearing effects for:
 * 1. Completed tasks that vanish with a poof
 * 2. Real-time updates that disappear automatically
 * 3. Temporary notifications that fade away
 * 4. Status changes that animate out
 * 5. Progress indicators that vanish when complete
 */

class MagicalDisappearingEffects {
    constructor() {
        this.customerId = 'shelly-mizrahi';
        this.effects = [];
        this.animations = [];
    }

    async createMagicalDisappearingEffects() {
        console.log('✨ MAGICAL DISAPPEARING EFFECTS - CUSTOMER APP');
        console.log('==============================================');

        try {
            // Step 1: Create magical disappearing animations
            await this.createMagicalAnimations();

            // Step 2: Create auto-vanishing components
            await this.createAutoVanishingComponents();

            // Step 3: Create real-time disappearing updates
            await this.createRealTimeDisappearingUpdates();

            // Step 4: Create task completion effects
            await this.createTaskCompletionEffects();

            // Step 5: Create notification vanishing system
            await this.createNotificationVanishingSystem();

            console.log('\n✨ MAGICAL DISAPPEARING EFFECTS IMPLEMENTED SUCCESSFULLY!');
            return true;

        } catch (error) {
            console.error('❌ Magical disappearing effects implementation failed:', error.message);
            return false;
        }
    }

    async createMagicalAnimations() {
        console.log('\n🎭 Creating Magical Disappearing Animations...');

        const magicalAnimations = `
/* ✨ Magical Disappearing Effects */

@keyframes magicalPoof {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
    filter: blur(0px);
  }
  25% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
    filter: blur(1px);
  }
  50% {
    transform: scale(0.8) rotate(-5deg);
    opacity: 0.5;
    filter: blur(2px);
  }
  75% {
    transform: scale(0.3) rotate(10deg);
    opacity: 0.2;
    filter: blur(4px);
  }
  100% {
    transform: scale(0) rotate(15deg);
    opacity: 0;
    filter: blur(8px);
  }
}

@keyframes sparkleDisappear {
  0% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  }
  25% {
    transform: scale(1.2);
    opacity: 0.8;
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.6);
  }
  50% {
    transform: scale(0.8);
    opacity: 0.5;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
  }
  75% {
    transform: scale(0.4);
    opacity: 0.2;
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
  }
  100% {
    transform: scale(0);
    opacity: 0;
    box-shadow: 0 0 0px rgba(255, 255, 255, 0);
  }
}

@keyframes fadeToInvisible {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.5;
    transform: translateY(-10px);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

@keyframes slideOutRight {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes slideOutLeft {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes shrinkAndFade {
  0% {
    transform: scale(1);
    opacity: 1;
    max-height: 100px;
  }
  50% {
    transform: scale(0.8);
    opacity: 0.5;
    max-height: 50px;
  }
  100% {
    transform: scale(0);
    opacity: 0;
    max-height: 0;
  }
}

@keyframes magicalGlow {
  0% {
    box-shadow: 0 0 5px rgba(30, 174, 247, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(30, 174, 247, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(30, 174, 247, 0.5);
  }
}

/* Magical Effect Classes */
.magical-poof {
  animation: magicalPoof 0.8s ease-in-out forwards;
}

.sparkle-disappear {
  animation: sparkleDisappear 1s ease-in-out forwards;
}

.fade-to-invisible {
  animation: fadeToInvisible 0.5s ease-out forwards;
}

.slide-out-right {
  animation: slideOutRight 0.6s ease-in-out forwards;
}

.slide-out-left {
  animation: slideOutLeft 0.6s ease-in-out forwards;
}

.shrink-and-fade {
  animation: shrinkAndFade 0.7s ease-in-out forwards;
}

.magical-glow {
  animation: magicalGlow 2s ease-in-out infinite;
}

/* Auto-vanishing elements */
.auto-vanish {
  transition: all 0.5s ease-in-out;
}

.auto-vanish.completed {
  animation: magicalPoof 0.8s ease-in-out forwards;
}

.auto-vanish.real-time {
  animation: fadeToInvisible 0.5s ease-out forwards;
}

.auto-vanish.notification {
  animation: slideOutRight 0.6s ease-in-out forwards;
}

/* Sparkle effects */
.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #5ffbfd;
  border-radius: 50%;
  animation: sparkleDisappear 1s ease-in-out forwards;
}

.sparkle:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 30%; left: 80%; animation-delay: 0.1s; }
.sparkle:nth-child(3) { top: 60%; left: 40%; animation-delay: 0.2s; }
.sparkle:nth-child(4) { top: 80%; left: 70%; animation-delay: 0.3s; }
.sparkle:nth-child(5) { top: 20%; left: 60%; animation-delay: 0.4s; }

/* Responsive magical effects */
@media (max-width: 768px) {
  .magical-poof {
    animation-duration: 0.6s;
  }
  
  .sparkle-disappear {
    animation-duration: 0.8s;
  }
}

/* Accessibility - respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .magical-poof,
  .sparkle-disappear,
  .fade-to-invisible,
  .slide-out-right,
  .slide-out-left,
  .shrink-and-fade {
    animation: none;
    opacity: 0;
    transform: scale(0);
  }
}
`;

        // Save magical animations to file
        const animationsPath = `web/rensto-site/src/styles/magical-disappearing-effects.css`;
        await fs.mkdir(path.dirname(animationsPath), { recursive: true });
        await fs.writeFile(animationsPath, magicalAnimations);

        console.log('✅ Magical Disappearing Animations created');
        return magicalAnimations;
    }

    async createAutoVanishingComponents() {
        console.log('\n🎪 Creating Auto-Vanishing Components...');

        const autoVanishingComponents = `
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AutoVanishingProps {
  children: React.ReactNode;
  duration?: number;
  onVanish?: () => void;
  effect?: 'poof' | 'sparkle' | 'fade' | 'slide' | 'shrink';
  className?: string;
}

export const AutoVanishing: React.FC<AutoVanishingProps> = ({
  children,
  duration = 3000,
  onVanish,
  effect = 'poof',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isVanishing, setIsVanishing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVanishing(true);
      setTimeout(() => {
        setIsVisible(false);
        onVanish?.();
      }, 800); // Animation duration
    }, duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration, onVanish]);

  const getAnimationClass = () => {
    switch (effect) {
      case 'poof': return 'magical-poof';
      case 'sparkle': return 'sparkle-disappear';
      case 'fade': return 'fade-to-invisible';
      case 'slide': return 'slide-out-right';
      case 'shrink': return 'shrink-and-fade';
      default: return 'magical-poof';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={\`auto-vanishing \${getAnimationClass()} \${className}\`}
        initial={{ opacity: 1, scale: 1 }}
        animate={isVanishing ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        {children}
        {effect === 'sparkle' && (
          <div className="sparkles">
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

interface TaskItemProps {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  onComplete?: (id: string) => void;
  autoVanish?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  description,
  status,
  onComplete,
  autoVanish = true
}) => {
  const [isVanishing, setIsVanishing] = useState(false);

  const handleComplete = () => {
    if (status === 'completed' && autoVanish) {
      setIsVanishing(true);
      setTimeout(() => {
        onComplete?.(id);
      }, 800);
    }
  };

  useEffect(() => {
    if (status === 'completed') {
      handleComplete();
    }
  }, [status]);

  if (isVanishing) {
    return (
      <motion.div
        className="task-item magical-poof"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <div className="task-content">
          <h3>{title}</h3>
          <p>{description}</p>
          <div className="sparkles">
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={\`task-item \${status === 'completed' ? 'completed' : ''}\`}>
      <div className="task-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="task-status">
          <span className={\`status-badge \${status}\`}>
            {status === 'pending' && 'ממתין'}
            {status === 'in-progress' && 'בתהליך'}
            {status === 'completed' && 'הושלם'}
          </span>
        </div>
      </div>
    </div>
  );
};

interface RealTimeUpdateProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onVanish?: () => void;
}

export const RealTimeUpdate: React.FC<RealTimeUpdateProps> = ({
  message,
  type,
  duration = 5000,
  onVanish
}) => {
  return (
    <AutoVanishing
      duration={duration}
      effect="slide"
      onVanish={onVanish}
      className={\`real-time-update \${type}\`}
    >
      <div className="update-content">
        <span className="update-icon">
          {type === 'info' && 'ℹ️'}
          {type === 'success' && '✅'}
          {type === 'warning' && '⚠️'}
          {type === 'error' && '❌'}
        </span>
        <span className="update-message">{message}</span>
      </div>
    </AutoVanishing>
  );
};
`;

        // Save auto-vanishing components to file
        const componentsPath = `web/rensto-site/src/components/AutoVanishing.tsx`;
        await fs.mkdir(path.dirname(componentsPath), { recursive: true });
        await fs.writeFile(componentsPath, autoVanishingComponents);

        console.log('✅ Auto-Vanishing Components created');
        return autoVanishingComponents;
    }

    async createRealTimeDisappearingUpdates() {
        console.log('\n⚡ Creating Real-Time Disappearing Updates...');

        const realTimeUpdates = `
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
`;

        // Save real-time updates to file
        const updatesPath = `web/rensto-site/src/components/RealTimeUpdates.tsx`;
        await fs.mkdir(path.dirname(updatesPath), { recursive: true });
        await fs.writeFile(updatesPath, realTimeUpdates);

        console.log('✅ Real-Time Disappearing Updates created');
        return realTimeUpdates;
    }

    async createTaskCompletionEffects() {
        console.log('\n🎯 Creating Task Completion Effects...');

        const taskCompletionEffects = `
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
}

interface TaskListProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onTaskVanish: (taskId: string) => void;
  autoVanishCompleted?: boolean;
  vanishDelay?: number;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskComplete,
  onTaskVanish,
  autoVanishCompleted = true,
  vanishDelay = 2000
}) => {
  const [vanishingTasks, setVanishingTasks] = useState<Set<string>>(new Set());

  const handleTaskComplete = (taskId: string) => {
    onTaskComplete(taskId);
    
    if (autoVanishCompleted) {
      setTimeout(() => {
        setVanishingTasks(prev => new Set(prev).add(taskId));
        setTimeout(() => {
          onTaskVanish(taskId);
          setVanishingTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
        }, 800); // Animation duration
      }, vanishDelay);
    }
  };

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'in-progress': return '#1eaef7';
      case 'completed': return '#00ff00';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return '#5ffbfd';
      case 'medium': return '#bf5700';
      case 'high': return '#fe3d51';
      default: return '#666';
    }
  };

  return (
    <div className="task-list-container">
      <AnimatePresence>
        {tasks.map((task) => {
          const isVanishing = vanishingTasks.has(task.id);
          
          return (
            <motion.div
              key={task.id}
              className={\`task-item \${task.status} \${isVanishing ? 'vanishing' : ''}\`}
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={isVanishing ? { opacity: 0, scale: 0, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -20 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{
                borderLeftColor: getTaskStatusColor(task.status),
                borderLeftWidth: '4px'
              }}
            >
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <div className="task-meta">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {task.priority === 'low' && 'נמוך'}
                    {task.priority === 'medium' && 'בינוני'}
                    {task.priority === 'high' && 'גבוה'}
                  </span>
                  <span className="category-badge">{task.category}</span>
                </div>
              </div>
              
              <p className="task-description">{task.description}</p>
              
              <div className="task-actions">
                {task.status === 'pending' && (
                  <button
                    onClick={() => handleTaskComplete(task.id)}
                    className="start-task-btn"
                  >
                    התחל משימה
                  </button>
                )}
                
                {task.status === 'in-progress' && (
                  <button
                    onClick={() => handleTaskComplete(task.id)}
                    className="complete-task-btn"
                  >
                    השלם משימה
                  </button>
                )}
                
                {task.status === 'completed' && (
                  <div className="completion-indicator">
                    <span className="completion-icon">✅</span>
                    <span className="completion-text">הושלם</span>
                  </div>
                )}
              </div>

              {isVanishing && (
                <div className="vanishing-effects">
                  <div className="sparkle"></div>
                  <div className="sparkle"></div>
                  <div className="sparkle"></div>
                  <div className="sparkle"></div>
                  <div className="sparkle"></div>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing tasks with auto-vanish
export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed', completedAt: new Date() }
        : task
    ));
  };

  const vanishTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return {
    tasks,
    addTask,
    completeTask,
    vanishTask,
    getTasksByStatus
  };
};
`;

        // Save task completion effects to file
        const taskEffectsPath = `web/rensto-site/src/components/TaskCompletionEffects.tsx`;
        await fs.mkdir(path.dirname(taskEffectsPath), { recursive: true });
        await fs.writeFile(taskEffectsPath, taskCompletionEffects);

        console.log('✅ Task Completion Effects created');
        return taskCompletionEffects;
    }

    async createNotificationVanishingSystem() {
        console.log('\n🔔 Creating Notification Vanishing System...');

        const notificationSystem = `
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
    <div className={\`notification-container fixed z-50 \${getPositionClasses()}\`}>
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
`;

        // Save notification system to file
        const notificationPath = `web/rensto-site/src/components/NotificationSystem.tsx`;
        await fs.mkdir(path.dirname(notificationPath), { recursive: true });
        await fs.writeFile(notificationPath, notificationSystem);

        console.log('✅ Notification Vanishing System created');
        return notificationSystem;
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const magicalEffects = new MagicalDisappearingEffects();
    magicalEffects.createMagicalDisappearingEffects()
        .then(success => {
            if (success) {
                console.log('\n✨ MAGICAL DISAPPEARING EFFECTS READY!');
                console.log('📋 What\'s implemented:');
                console.log('  ✅ Magical Disappearing Animations');
                console.log('  ✅ Auto-Vanishing Components');
                console.log('  ✅ Real-Time Disappearing Updates');
                console.log('  ✅ Task Completion Effects');
                console.log('  ✅ Notification Vanishing System');
                console.log('  ✅ Complete Magical Experience');
                process.exit(0);
            } else {
                console.log('\n❌ Magical disappearing effects implementation failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Magical disappearing effects execution failed:', error);
            process.exit(1);
        });
}

export { MagicalDisappearingEffects };
