
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
              className={`task-item ${task.status} ${isVanishing ? 'vanishing' : ''}`}
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
