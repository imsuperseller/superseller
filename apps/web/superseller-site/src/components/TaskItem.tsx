'use client';

import React, { useState } from 'react';
import { Task, TaskStep } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: string, status: string) => void;
}

export function TaskItem({ task, onUpdate }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api_setup': return '🔗';
      case 'credentials': return '🔐';
      case 'payment': return '💳';
      case 'integration': return '🔌';
      case 'testing': return '🧪';
      case 'onboarding': return '🚀';
      default: return '📋';
    }
  };

  const completedSteps = task.steps.filter(step => step.status === 'completed').length;
  const totalSteps = task.steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="bg-superseller-card rounded-lg border border-superseller-border p-6 space-y-4">
      {/* Task Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-2xl">{getTypeIcon(task.type)}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-superseller-text">{task.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} text-white`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <p className="text-superseller-text-muted text-sm">{task.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-superseller-text-muted hover:text-superseller-primary transition-colors"
            title="Get Help"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-superseller-text-muted hover:text-superseller-primary transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            <svg className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Task Meta */}
      <div className="flex items-center justify-between text-sm text-superseller-text-muted">
        <div className="flex items-center space-x-4">
          <span>⏱️ {task.estimatedTime}</span>
          {task.dueDate && (
            <span>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>📊 {completedSteps}/{totalSteps} steps</span>
          <div className="w-16 bg-superseller-border rounded-full h-2">
            <div 
              className="bg-superseller-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Help Resources */}
      {showHelp && (
        <div className="bg-superseller-dark rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-superseller-text">💡 Need Help?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {task.helpResources.map((resource, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-lg">
                  {resource.type === 'email' && '📧'}
                  {resource.type === 'documentation' && '📚'}
                  {resource.type === 'video' && '🎥'}
                  {resource.type === 'chat' && '💬'}
                  {resource.type === 'phone' && '📞'}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-superseller-text">{resource.title}</p>
                  <p className="text-xs text-superseller-text-muted">{resource.description}</p>
                </div>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-superseller-primary hover:text-superseller-accent text-sm"
                  >
                    Open →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Steps */}
      {expanded && (
        <div className="space-y-3">
          <h4 className="font-medium text-superseller-text">📝 Steps</h4>
          <div className="space-y-2">
            {task.steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3 p-3 bg-superseller-dark rounded-lg">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-superseller-border text-superseller-text-muted'
                }`}>
                  {step.status === 'completed' ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-superseller-text">{step.title}</p>
                  <p className="text-xs text-superseller-text-muted">{step.description}</p>
                </div>
                {step.actionUrl && step.actionText && (
                  <a
                    href={step.actionUrl}
                    className="px-3 py-1 bg-superseller-primary text-white text-xs rounded-lg hover:bg-superseller-accent transition-colors"
                  >
                    {step.actionText}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-superseller-border">
        <div className="flex items-center space-x-2">
          {task.status === 'pending' && (
            <button
              onClick={() => onUpdate(task.id, 'in_progress')}
              className="px-4 py-2 bg-superseller-primary text-white text-sm rounded-lg hover:bg-superseller-accent transition-colors"
            >
              Start Task
            </button>
          )}
          {task.status === 'in_progress' && (
            <button
              onClick={() => onUpdate(task.id, 'completed')}
              className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              Mark Complete
            </button>
          )}
          {task.status === 'blocked' && (
            <button
              onClick={() => onUpdate(task.id, 'pending')}
              className="px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Unblock Task
            </button>
          )}
        </div>
        
        {task.dependencies && task.dependencies.length > 0 && (
          <div className="text-xs text-superseller-text-muted">
            ⚠️ Depends on {task.dependencies.length} other task(s)
          </div>
        )}
      </div>
    </div>
  );
}
