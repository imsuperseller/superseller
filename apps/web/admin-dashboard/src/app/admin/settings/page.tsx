'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Save,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Key,
  Users,
  Activity
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Rensto Universal Automation Platform',
    siteDescription: 'Professional automation platform for businesses',
    timezone: 'UTC',
    language: 'en',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    systemAlerts: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    ipWhitelist: false,
    
    // API Settings
    apiRateLimit: 1000,
    webhookRetries: 3,
    logLevel: 'info',
    
    // User Management
    allowRegistration: false,
    defaultUserRole: 'viewer',
    requireEmailVerification: true,
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    analytics: true,
    errorReporting: true
  });

  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API', icon: Database },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'system', label: 'System', icon: Activity }
  ];

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', settings);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">Site Name</Label>
          <Input
            id="siteName"
            value={settings.siteName}
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            value={settings.timezone}
            onChange={(e) => setSettings({...settings, timezone: e.target.value})}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="siteDescription">Site Description</Label>
        <Input
          id="siteDescription"
          value={settings.siteDescription}
          onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="emailNotifications">Email Notifications</Label>
            <p className="text-sm text-gray-600">Receive email notifications for important events</p>
          </div>
          <Switch
            id="emailNotifications"
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="pushNotifications">Push Notifications</Label>
            <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
          </div>
          <Switch
            id="pushNotifications"
            checked={settings.pushNotifications}
            onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="weeklyReports">Weekly Reports</Label>
            <p className="text-sm text-gray-600">Receive weekly summary reports</p>
          </div>
          <Switch
            id="weeklyReports"
            checked={settings.weeklyReports}
            onCheckedChange={(checked) => setSettings({...settings, weeklyReports: checked})}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="systemAlerts">System Alerts</Label>
            <p className="text-sm text-gray-600">Receive alerts for system issues</p>
          </div>
          <Switch
            id="systemAlerts"
            checked={settings.systemAlerts}
            onCheckedChange={(checked) => setSettings({...settings, systemAlerts: checked})}
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
            <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
          </div>
          <Switch
            id="twoFactorAuth"
            checked={settings.twoFactorAuth}
            onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="ipWhitelist">IP Whitelist</Label>
            <p className="text-sm text-gray-600">Restrict access to specific IP addresses</p>
          </div>
          <Switch
            id="ipWhitelist"
            checked={settings.ipWhitelist}
            onCheckedChange={(checked) => setSettings({...settings, ipWhitelist: checked})}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordPolicy">Password Policy</Label>
            <Input
              id="passwordPolicy"
              value={settings.passwordPolicy}
              onChange={(e) => setSettings({...settings, passwordPolicy: e.target.value})}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
          <Input
            id="apiRateLimit"
            type="number"
            value={settings.apiRateLimit}
            onChange={(e) => setSettings({...settings, apiRateLimit: parseInt(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="webhookRetries">Webhook Retries</Label>
          <Input
            id="webhookRetries"
            type="number"
            value={settings.webhookRetries}
            onChange={(e) => setSettings({...settings, webhookRetries: parseInt(e.target.value)})}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="logLevel">Log Level</Label>
        <Input
          id="logLevel"
          value={settings.logLevel}
          onChange={(e) => setSettings({...settings, logLevel: e.target.value})}
        />
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowRegistration">Allow User Registration</Label>
            <p className="text-sm text-gray-600">Allow new users to register accounts</p>
          </div>
          <Switch
            id="allowRegistration"
            checked={settings.allowRegistration}
            onCheckedChange={(checked) => setSettings({...settings, allowRegistration: checked})}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
            <p className="text-sm text-gray-600">Require email verification for new accounts</p>
          </div>
          <Switch
            id="requireEmailVerification"
            checked={settings.requireEmailVerification}
            onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultUserRole">Default User Role</Label>
          <Input
            id="defaultUserRole"
            value={settings.defaultUserRole}
            onChange={(e) => setSettings({...settings, defaultUserRole: e.target.value})}
          />
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            <p className="text-sm text-gray-600">Put the system in maintenance mode</p>
          </div>
          <Switch
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="debugMode">Debug Mode</Label>
            <p className="text-sm text-gray-600">Enable debug logging and detailed error messages</p>
          </div>
          <Switch
            id="debugMode"
            checked={settings.debugMode}
            onCheckedChange={(checked) => setSettings({...settings, debugMode: checked})}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="analytics">Analytics</Label>
            <p className="text-sm text-gray-600">Collect usage analytics and performance data</p>
          </div>
          <Switch
            id="analytics"
            checked={settings.analytics}
            onCheckedChange={(checked) => setSettings({...settings, analytics: checked})}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="errorReporting">Error Reporting</Label>
            <p className="text-sm text-gray-600">Automatically report errors to monitoring service</p>
          </div>
          <Switch
            id="errorReporting"
            checked={settings.errorReporting}
            onCheckedChange={(checked) => setSettings({...settings, errorReporting: checked})}
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'api': return renderApiSettings();
      case 'users': return renderUserSettings();
      case 'system': return renderSystemSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your admin dashboard and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab);
                  const Icon = activeTabData?.icon;
                  return (
                    <>
                      {Icon && <Icon className="mr-2 h-5 w-5" />}
                      {activeTabData?.label} Settings
                    </>
                  );
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
              <div className="mt-6 pt-6 border-t">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
