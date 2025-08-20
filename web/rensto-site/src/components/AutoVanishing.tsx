
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
        className={`auto-vanishing ${getAnimationClass()} ${className}`}
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
    <div className={`task-item ${status === 'completed' ? 'completed' : ''}`}>
      <div className="task-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="task-status">
          <span className={`status-badge ${status}`}>
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
      className={`real-time-update ${type}`}
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
