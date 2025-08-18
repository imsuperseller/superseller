'use client';

import React, { useState, useEffect } from 'react';
import { Circle, Circle, AlertCircle, Clock, X, MessageSquare } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'setup' | 'content' | 'integration' | 'payment' | 'review';
  assignedTo: 'customer' | 'admin' | 'both';
  dueDate?: Date;
  completedDate?: Date;
  notes?: string;
  attachments?: string[];
}

interface CustomerQuestionsProps {
  customerId: string;
  questions: Question[];
  onQuestionUpdate: (questionId: string, updates: Partial<Question>) => void;
  onAddNote: (questionId: string, note: string) => void;
}

export function CustomerQuestions({ customerId, questions, onQuestionUpdate, onAddNote }: CustomerQuestionsProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [newNote, setNewNote] = useState('');

  const filteredQuestions = questions.filter(q => {
    if (filter === 'all') return true;
    return q.status === filter;
  });

  const getStatusIcon = (status: Question['status']) => {
    switch (status) {
      case 'completed':
        return <Circle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 style={{ color: 'var(--rensto-blue)' }}" />;
      case 'blocked':
        return <AlertCircle className="w-5 h-5 style={{ color: 'var(--rensto-red)' }}" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Question['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: Question['category']) => {
    switch (category) {
      case 'setup':
        return '⚙️';
      case 'content':
        return '📝';
      case 'integration':
        return '🔗';
      case 'payment':
        return '💳';
      case 'review':
        return '👀';
      default:
        return '📋';
    }
  };

  const handleStatusChange = (questionId: string, status: Question['status']) => {
    onQuestionUpdate(questionId, { 
      status,
      completedDate: status === 'completed' ? new Date() : undefined
    });
  };

  const handleAddNote = () => {
    if (newNote.trim() && selectedQuestion) {
      onAddNote(selectedQuestion.id, newNote);
      setNewNote('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Questions & Tasks</h2>
          <p className="text-gray-600">Track progress and communicate with your team</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredQuestions.length} of {questions.length} tasks
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {(['all', 'pending', 'in-progress', 'completed'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <div
            key={question.id}
            className={`p-6 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer ${
              getPriorityColor(question.priority)
            } ${selectedQuestion?.id === question.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedQuestion(question)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(question.status)}
                  <span className="text-2xl">{getCategoryIcon(question.category)}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                    {question.assignedTo === 'customer' && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        Your Action
                      </span>
                    )}
                    {question.assignedTo === 'admin' && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        We're Working On It
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{question.description}</p>
                  
                  {question.dueDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>Due: {question.dueDate.toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {question.notes && (
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-sm text-gray-700">{question.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={question.status}
                  onChange={(e) => handleStatusChange(question.id, e.target.value as Question['status'])}
                  className="px-3 py-1 text-sm border rounded-lg bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedQuestion.title}</h3>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-600">{selectedQuestion.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  <select
                    value={selectedQuestion.status}
                    onChange={(e) => handleStatusChange(selectedQuestion.id, e.target.value as Question['status'])}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Assigned To</h4>
                  <div className="flex items-center space-x-2">
                    {selectedQuestion.assignedTo === 'customer' ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        Your Action Required
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        We're Working On It
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Add Note</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note or update..."
                    className="flex-1 px-3 py-2 border rounded-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {selectedQuestion.attachments && selectedQuestion.attachments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedQuestion.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        className="flex items-center space-x-2 style={{ color: 'var(--rensto-blue)' }} hover:style={{ color: 'var(--rensto-blue)' }}"
                      >
                        <span>📎</span>
                        <span>{attachment.split('/').pop()}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
