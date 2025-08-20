'use client';

import React, { useState, useEffect } from 'react';
import { TaskItem } from './TaskItem';
import { TaskProgress } from './TaskProgress';
import { Task } from '../types/Task';

interface TaskListProps {
    customerId: string;
    onTaskUpdate?: (taskId: string, status: string) => void;
}

export function TaskList({ customerId, onTaskUpdate }: TaskListProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'blocked'>('all');

    useEffect(() => {
        fetchTasks();
    }, [customerId]);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`/api/customers/${customerId}/tasks`);
            const data = await response.json();

            if (data.success) {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskUpdate = async (taskId: string, status: string) => {
        try {
            const response = await fetch(`/api/customers/${customerId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                setTasks(prev => prev.map(task =>
                    task.id === taskId ? { ...task, status } : task
                ));
                onTaskUpdate?.(taskId, status);
            }
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    const sortedTasks = filteredTasks.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rensto-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Progress Overview */}
            <TaskProgress tasks={tasks} />

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2">
                {[
                    { key: 'all', label: 'All Tasks', count: tasks.length },
                    { key: 'urgent', label: 'Urgent', count: tasks.filter(t => t.priority === 'urgent').length },
                    { key: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'pending').length },
                    { key: 'in_progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
                    { key: 'blocked', label: 'Blocked', count: tasks.filter(t => t.status === 'blocked').length }
                ].map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === key
                                ? 'bg-rensto-primary text-white'
                                : 'bg-rensto-card text-rensto-text hover:bg-rensto-accent'
                            }`}
                    >
                        {label} ({count})
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {sortedTasks.length === 0 ? (
                    <div className="text-center py-8 text-rensto-text-muted">
                        <p className="text-lg font-medium">No tasks found</p>
                        <p className="text-sm">All caught up! 🎉</p>
                    </div>
                ) : (
                    sortedTasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onUpdate={handleTaskUpdate}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
