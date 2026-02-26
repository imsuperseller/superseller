'use client';

import React from 'react';
import { Task } from '../types/Task';

interface TaskProgressProps {
  tasks: Task[];
}

export function TaskProgress({ tasks }: TaskProgressProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const blockedTasks = tasks.filter(task => task.status === 'blocked').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const urgentTasks = tasks.filter(task => task.priority === 'urgent');
  const highPriorityTasks = tasks.filter(task => task.priority === 'high');
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressMessage = (percentage: number) => {
    if (percentage === 100) return '🎉 All tasks completed!';
    if (percentage >= 80) return '🚀 Almost there!';
    if (percentage >= 60) return '📈 Great progress!';
    if (percentage >= 40) return '💪 Keep going!';
    if (percentage >= 20) return '🎯 Getting started!';
    return '🚀 Let\'s begin!';
  };

  return (
    <div className="bg-superseller-card rounded-lg border border-superseller-border p-6 space-y-6">
      {/* Overall Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-superseller-text">Overall Progress</h3>
          <span className="text-2xl font-bold text-superseller-primary">{Math.round(overallProgress)}%</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-superseller-text-muted">Progress</span>
            <span className="text-superseller-text">{completedTasks} of {totalTasks} tasks</span>
          </div>
          <div className="w-full bg-superseller-border rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(overallProgress)}`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm text-superseller-text-muted text-center">
            {getProgressMessage(overallProgress)}
          </p>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="text-2xl font-bold text-green-500">{completedTasks}</div>
          <div className="text-xs text-green-500/80">Completed</div>
        </div>
        <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="text-2xl font-bold text-blue-500">{inProgressTasks}</div>
          <div className="text-xs text-blue-500/80">In Progress</div>
        </div>
        <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <div className="text-2xl font-bold text-yellow-500">{pendingTasks}</div>
          <div className="text-xs text-yellow-500/80">Pending</div>
        </div>
        <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="text-2xl font-bold text-red-500">{blockedTasks}</div>
          <div className="text-xs text-red-500/80">Blocked</div>
        </div>
      </div>

      {/* Priority Alerts */}
      {(urgentTasks.length > 0 || highPriorityTasks.length > 0) && (
        <div className="space-y-3">
          <h4 className="font-medium text-superseller-text">⚠️ Priority Alerts</h4>
          
          {urgentTasks.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">🚨</span>
                <span className="text-sm font-medium text-red-500">
                  {urgentTasks.length} urgent task{urgentTasks.length > 1 ? 's' : ''} need{urgentTasks.length > 1 ? '' : 's'} attention
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {urgentTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="text-xs text-red-500/80">
                    • {task.title}
                  </div>
                ))}
                {urgentTasks.length > 3 && (
                  <div className="text-xs text-red-500/80">
                    • +{urgentTasks.length - 3} more urgent tasks
                  </div>
                )}
              </div>
            </div>
          )}
          
          {highPriorityTasks.length > 0 && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-orange-500">⚡</span>
                <span className="text-sm font-medium text-orange-500">
                  {highPriorityTasks.length} high priority task{highPriorityTasks.length > 1 ? 's' : ''} pending
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Time Estimates */}
      <div className="space-y-3">
        <h4 className="font-medium text-superseller-text">⏱️ Time Estimates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-superseller-dark rounded-lg">
            <div className="text-sm text-superseller-text-muted">Remaining Tasks</div>
            <div className="text-lg font-semibold text-superseller-text">
              {pendingTasks + inProgressTasks} tasks
            </div>
          </div>
          <div className="p-3 bg-superseller-dark rounded-lg">
            <div className="text-sm text-superseller-text-muted">Estimated Time</div>
            <div className="text-lg font-semibold text-superseller-text">
              {calculateEstimatedTime(tasks)} remaining
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {pendingTasks > 0 && (
        <div className="p-4 bg-superseller-primary/10 border border-superseller-primary/20 rounded-lg">
          <h4 className="font-medium text-superseller-primary mb-2">🎯 Recommended Next Steps</h4>
          <div className="space-y-2">
            {getNextSteps(tasks).map((step, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className="text-superseller-primary">{index + 1}.</span>
                <span className="text-superseller-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper methods
function calculateEstimatedTime(tasks: Task[]): string {
  const pendingTasks = tasks.filter(task => 
    task.status === 'pending' || task.status === 'in_progress'
  );
  
  if (pendingTasks.length === 0) return '0 minutes';
  
  // Simple estimation based on task types
  const timeEstimates = pendingTasks.map(task => {
    switch (task.type) {
      case 'api_setup': return 120; // 2 hours
      case 'credentials': return 30; // 30 minutes
      case 'payment': return 10; // 10 minutes
      case 'integration': return 60; // 1 hour
      case 'testing': return 45; // 45 minutes
      case 'onboarding': return 90; // 1.5 hours
      default: return 30; // 30 minutes
    }
  });
  
  const totalMinutes = timeEstimates.reduce((sum, time) => sum + time, 0);
  
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  } else if (totalMinutes < 1440) {
    const hours = Math.round(totalMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.round(totalMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}

function getNextSteps(tasks: Task[]): string[] {
  const steps: string[] = [];
  
  // Check for blocked tasks first
  const blockedTasks = tasks.filter(task => task.status === 'blocked');
  if (blockedTasks.length > 0) {
    steps.push(`Resolve ${blockedTasks.length} blocked task${blockedTasks.length > 1 ? 's' : ''}`);
  }
  
  // Check for urgent tasks
  const urgentTasks = tasks.filter(task => 
    task.priority === 'urgent' && task.status === 'pending'
  );
  if (urgentTasks.length > 0) {
    steps.push(`Complete ${urgentTasks.length} urgent task${urgentTasks.length > 1 ? 's' : ''}`);
  }
  
  // Check for high priority tasks
  const highPriorityTasks = tasks.filter(task => 
    task.priority === 'high' && task.status === 'pending'
  );
  if (highPriorityTasks.length > 0) {
    steps.push(`Work on ${highPriorityTasks.length} high priority task${highPriorityTasks.length > 1 ? 's' : ''}`);
  }
  
  // General next steps
  if (steps.length === 0) {
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    if (pendingTasks.length > 0) {
      steps.push(`Start working on ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''}`);
    }
  }
  
  return steps.slice(0, 3); // Limit to 3 steps
}
