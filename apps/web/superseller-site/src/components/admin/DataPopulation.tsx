'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { 
  Database, 
  Users, 
  Bot, 
  Workflow, 
  Play,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface DataPopulationProps {
  className?: string;
}

export default function DataPopulation({ className = '' }: DataPopulationProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handlePopulateData = async () => {
    if (!confirm('This will populate the system with sample data. This action cannot be undone. Continue?')) {
      return;
    }

    setLoading(true);
    setStatus('loading');
    setMessage('Populating data...');

    try {
      const response = await fetch('/api/setup/populate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Data population completed successfully!');
      } else {
        setStatus('error');
        setMessage(result.error || 'Data population failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to populate data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 superseller-animate-glow" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 style={{ color: 'var(--superseller-red)' }}" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'loading':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Population</h2>
          <p className="text-muted-foreground">
            Populate the system with realistic sample data for demonstration
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge className={getStatusColor()}>
            {status === 'idle' && 'Ready'}
            {status === 'loading' && 'Populating...'}
            {status === 'success' && 'Completed'}
            {status === 'error' && 'Failed'}
          </Badge>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          status === 'success' ? 'bg-green-50 text-green-800' :
          status === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Organizations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-sm text-muted-foreground">
              Multi-tenant organizations with different business types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50+</div>
            <p className="text-sm text-muted-foreground">
              Users across all organizations with realistic roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Agents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50+</div>
            <p className="text-sm text-muted-foreground">
              AI agents with performance history and metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Workflows</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30+</div>
            <p className="text-sm text-muted-foreground">
              Automated workflows with execution history
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Software as a Service', icon: '☁️', description: 'SaaS platform with user onboarding and analytics' },
              { name: 'Business Consulting', icon: '💼', description: 'Consulting firm with lead management and proposals' },
              { name: 'E-commerce', icon: '🛒', description: 'Online retail with inventory and order management' },
              { name: 'Healthcare Technology', icon: '🏥', description: 'Healthcare platform with patient management' },
              { name: 'Education Technology', icon: '🎓', description: 'EdTech platform with student tracking' }
            ].map((template, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Population</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Warning</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This action will populate the system with sample data. Existing data may be cleared. 
                  This is intended for demonstration and testing purposes only.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handlePopulateData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 superseller-animate-glow" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {loading ? 'Populating Data...' : 'Populate Sample Data'}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Estimated time: 30-60 seconds
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
