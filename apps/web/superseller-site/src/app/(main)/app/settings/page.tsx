'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Label } from '@/components/ui/label-enhanced';
import { Switch } from '@/components/ui/switch-enhanced';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-superseller-text-primary">Settings</h1>
        <p className="text-superseller-text-secondary mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader>
            <CardTitle className="text-superseller-text-primary">Account Information</CardTitle>
            <CardDescription className="text-superseller-text-secondary">Update your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-superseller-text-secondary">Full Name</Label>
              <Input id="name" defaultValue="Ben Ginati" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label htmlFor="email" className="text-superseller-text-secondary">Email</Label>
              <Input id="email" defaultValue="ben@tax4us.co.il" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label htmlFor="company" className="text-superseller-text-secondary">Company</Label>
              <Input id="company" defaultValue="Tax4Us" className="bg-white/5 border-white/10 text-white" />
            </div>
            <Button variant="supersellerPrimary">Save Changes</Button>
          </CardContent>
        </Card>

        <Card variant="supersellerNeon" className="superseller-card-neon">
          <CardHeader>
            <CardTitle className="text-superseller-text-primary">Notifications</CardTitle>
            <CardDescription className="text-superseller-text-secondary">Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-superseller-text-primary">Email Notifications</Label>
                <p className="text-sm text-superseller-text-secondary">Receive email updates about agent runs</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-superseller-text-primary">Approval Requests</Label>
                <p className="text-sm text-superseller-text-secondary">Get notified when approval is needed</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-superseller-text-primary">Billing Alerts</Label>
                <p className="text-sm text-superseller-text-secondary">Receive billing and usage alerts</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
