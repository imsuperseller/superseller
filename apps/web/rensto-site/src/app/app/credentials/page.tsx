'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import {
  Key,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

const mockCredentials = [
  {
    id: '1',
    name: 'WordPress API',
    type: 'wordpress',
    status: 'active',
    lastUsed: '2024-01-20T16:30:00Z',
    description: 'WordPress site credentials for content publishing',
  },
  {
    id: '2',
    name: 'OpenAI API',
    type: 'openai',
    status: 'active',
    lastUsed: '2024-01-20T14:15:00Z',
    description: 'OpenAI API key for content generation',
  },
  {
    id: '3',
    name: 'Facebook Graph API',
    type: 'facebook',
    status: 'active',
    lastUsed: '2024-01-20T12:00:00Z',
    description: 'Facebook API for social media automation',
  },
  {
    id: '4',
    name: 'LinkedIn API',
    type: 'linkedin',
    status: 'expired',
    lastUsed: '2024-01-15T10:00:00Z',
    description: 'LinkedIn API for professional networking',
  },
  {
    id: '5',
    name: 'Gmail API',
    type: 'gmail',
    status: 'active',
    lastUsed: '2024-01-19T09:30:00Z',
    description: 'Gmail API for email automation',
  },
];

export default function CredentialsPage() {
  const [showSecrets, setShowSecrets] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="renstoSuccess">Active</Badge>;
      case 'expired':
        return <Badge variant="renstoError">Expired</Badge>;
      case 'inactive':
        return <Badge variant="renstoSecondary">Inactive</Badge>;
      default:
        return <Badge variant="renstoSecondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Credentials</h1>
          <p className="text-slate-600 mt-2">
            Manage your API keys and service credentials
          </p>
        </div>
        <Button variant="renstoPrimary">
          <Plus className="h-4 w-4 mr-2" />
          Add Credential
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCredentials.map((credential) => (
          <Card key={credential.id} className="rensto-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{credential.name}</CardTitle>
                {getStatusBadge(credential.status)}
              </div>
              <CardDescription>{credential.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Type:</span>
                  <span className="text-sm font-medium capitalize">{credential.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Last Used:</span>
                  <span className="text-sm text-slate-600">
                    {new Date(credential.lastUsed).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
