'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  FolderOpen,
  Plus,
  Search,
  Calendar,
  DollarSign,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Eye,
  MessageSquare,
  Target,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'active' | 'review' | 'complete';
  progress: number;
  dueDate: string;
  budget: number;
  spent: number;
  teamMembers: string[];
  priority: 'low' | 'medium' | 'high';
  description: string;
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full rensto-animate-glow mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  // Mock data - in real app this would come from MongoDB
  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      client: 'Acme Corporation',
      status: 'active',
      progress: 75,
      dueDate: '2024-02-15',
      budget: 25000,
      spent: 18750,
      teamMembers: ['John Doe', 'Jane Smith'],
      priority: 'high',
      description: 'Complete website redesign with modern UI/UX',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      client: 'TechStart Inc',
      status: 'planning',
      progress: 15,
      dueDate: '2024-03-30',
      budget: 50000,
      spent: 7500,
      teamMembers: ['Mike Johnson', 'Sarah Wilson'],
      priority: 'medium',
      description: 'iOS and Android mobile application development',
    },
    {
      id: '3',
      name: 'E-commerce Platform',
      client: 'Global Solutions',
      status: 'review',
      progress: 90,
      dueDate: '2024-01-25',
      budget: 35000,
      spent: 31500,
      teamMembers: ['Alex Brown', 'Lisa Chen'],
      priority: 'high',
      description: 'Full e-commerce platform with payment integration',
    },
    {
      id: '4',
      name: 'Brand Identity Design',
      client: 'InnovateCo',
      status: 'complete',
      progress: 100,
      dueDate: '2024-01-10',
      budget: 15000,
      spent: 15000,
      teamMembers: ['David Lee'],
      priority: 'low',
      description: 'Complete brand identity and logo design',
    },
    {
      id: '5',
      name: 'Data Analytics Dashboard',
      client: 'Acme Corporation',
      status: 'active',
      progress: 45,
      dueDate: '2024-02-28',
      budget: 20000,
      spent: 9000,
      teamMembers: ['John Doe', 'Emily Davis'],
      priority: 'medium',
      description: 'Business intelligence dashboard with real-time data',
    },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-600';
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'review':
        return 'bg-amber-100 text-amber-800';
      case 'complete':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const statusColumns = [
    { key: 'planning', title: 'Planning', color: 'bg-blue-50' },
    { key: 'active', title: 'Active', color: 'bg-emerald-50' },
    { key: 'review', title: 'Review', color: 'bg-amber-50' },
    { key: 'complete', title: 'Complete', color: 'bg-slate-50' },
  ];

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const overdueProjects = projects.filter(
    p => getDaysUntilDue(p.dueDate) < 0 && p.status !== 'complete'
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Project Management
            </h1>
            <p className="text-slate-600 mt-1">
              Track project progress, manage timelines, and monitor team
              performance.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white border border-slate-300 rounded-lg">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                List
              </button>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {projects.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-6 w-6 style={{ color: 'var(--rensto-blue)' }}" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {activeProjects}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Budget
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-slate-900">
                  {overdueProjects}
                </p>
              </div>
              <div className="w-12 h-12 style={{ backgroundColor: 'var(--rensto-bg-primary)' }} rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 style={{ color: 'var(--rensto-red)' }}" />
              </div>
            </div>
          </div>
        </div>

        {/* s */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by name or client..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="review">Review</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        </div>

        {/* Kanban Board */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statusColumns.map(column => {
              const columnProjects = filteredProjects.filter(
                p => p.status === column.key
              );
              return (
                <div
                  key={column.key}
                  className={`${column.color} rounded-xl p-4`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">
                      {column.title}
                    </h3>
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-slate-600">
                      {columnProjects.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {columnProjects.map(project => (
                      <div
                        key={project.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-slate-900 text-sm">
                            {project.name}
                          </h4>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                              project.priority
                            )}`}
                          >
                            {project.priority}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mb-3">
                          {project.client}
                        </p>

                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(project.dueDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(project.budget)}</span>
                          </div>
                        </div>

                        {getDaysUntilDue(project.dueDate) < 0 &&
                          project.status !== 'complete' && (
                            <div className="mt-2 p-2 style={{ backgroundColor: 'var(--rensto-bg-primary)' }} border border-red-200 rounded text-xs style={{ color: 'var(--rensto-red)' }}">
                              Overdue by{' '}
                              {Math.abs(getDaysUntilDue(project.dueDate))} days
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                            <FolderOpen className="h-5 w-5 text-slate-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {project.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {project.client}
                            </div>
                            <div className="text-sm text-slate-400">
                              {project.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status.charAt(0).toUpperCase() +
                            project.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-900">
                            {project.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(project.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatCurrency(project.budget)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex -space-x-2">
                          {project.teamMembers
                            .slice(0, 3)
                            .map((member, index) => (
                              <div
                                key={index}
                                className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-xs font-medium text-slate-600"
                              >
                                {member
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </div>
                            ))}
                          {project.teamMembers.length > 3 && (
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                              +{project.teamMembers.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-1 text-slate-400 hover:text-slate-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-slate-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-slate-600">
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
