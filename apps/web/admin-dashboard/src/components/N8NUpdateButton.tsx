'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface UpdateStatus {
  success: boolean;
  message: string;
  duration?: string;
  output?: string;
  error?: string;
  timestamp: string;
  dryRun?: boolean;
  force?: boolean;
}

interface N8NStatus {
  success: boolean;
  status: 'online' | 'offline';
  n8n_url: string;
  workflow_count?: number;
  error?: string;
  timestamp: string;
}

export default function N8NUpdateButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [n8nStatus, setN8nStatus] = useState<N8NStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const checkN8NStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch('/api/n8n/update');
      const status: N8NStatus = await response.json();
      setN8nStatus(status);
    } catch (error) {
      console.error('Failed to check n8n status:', error);
      setN8nStatus({
        success: false,
        status: 'offline',
        n8n_url: 'http://n8n.rensto.com',
        error: 'Failed to check status',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const updateN8N = async (dryRun: boolean = false, force: boolean = false) => {
    setIsUpdating(true);
    setUpdateStatus(null);
    
    try {
      const response = await fetch('/api/n8n/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dryRun, force }),
      });
      
      const result: UpdateStatus = await response.json();
      setUpdateStatus(result);
      
      // Refresh status after update
      if (result.success) {
        setTimeout(() => {
          checkN8NStatus();
        }, 2000);
      }
      
    } catch (error) {
      console.error('Failed to update n8n:', error);
      setUpdateStatus({
        success: false,
        message: 'Failed to update n8n',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        dryRun,
        force
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = () => {
    if (isCheckingStatus) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!n8nStatus) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (n8nStatus.status === 'online') return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (!n8nStatus) return <Badge variant="secondary">Unknown</Badge>;
    if (n8nStatus.status === 'online') return <Badge variant="default" className="bg-green-500">Online</Badge>;
    return <Badge variant="destructive">Offline</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          N8N Update System
        </CardTitle>
        <CardDescription>
          Complete n8n update system with zero data loss guarantee
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">N8N Status:</span>
            {getStatusBadge()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkN8NStatus}
            disabled={isCheckingStatus}
          >
            {isCheckingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check Status
          </Button>
        </div>

        {n8nStatus && (
          <div className="text-sm text-muted-foreground">
            <p><strong>URL:</strong> {n8nStatus.n8n_url}</p>
            {n8nStatus.workflow_count && (
              <p><strong>Workflows:</strong> {n8nStatus.workflow_count}</p>
            )}
            <p><strong>Last Check:</strong> {new Date(n8nStatus.timestamp).toLocaleString()}</p>
          </div>
        )}

        {/* Update Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => updateN8N(false, false)}
            disabled={isUpdating}
            className="flex-1"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Update N8N
          </Button>
          
          <Button
            variant="outline"
            onClick={() => updateN8N(true, false)}
            disabled={isUpdating}
          >
            Dry Run
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => updateN8N(false, true)}
            disabled={isUpdating}
          >
            Force Update
          </Button>
        </div>

        {/* Update Status */}
        {updateStatus && (
          <Alert className={updateStatus.success ? 'border-green-500' : 'border-red-500'}>
            <div className="flex items-center gap-2">
              {updateStatus.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">{updateStatus.message}</p>
                  {updateStatus.duration && (
                    <p className="text-sm text-muted-foreground">
                      Duration: {updateStatus.duration}
                    </p>
                  )}
                  {updateStatus.error && (
                    <p className="text-sm text-red-600">
                      Error: {updateStatus.error}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(updateStatus.timestamp).toLocaleString()}
                  </p>
                </div>
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Update Process Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Update Process:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Verify current n8n state</li>
            <li>Create comprehensive backup</li>
            <li>Authenticate with Docker Hub</li>
            <li>Pull latest n8n image</li>
            <li>Stop current container</li>
            <li>Remove old container</li>
            <li>Start new container with preserved data</li>
            <li>Verify upgrade success</li>
            <li>Generate completion report</li>
          </ul>
        </div>

        {/* Safety Information */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Zero Data Loss Guarantee</p>
              <p className="text-sm">
                This update system preserves all workflows, credentials, and community nodes.
                A comprehensive backup is created before any changes are made.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
