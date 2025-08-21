'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Textarea } from '@/components/ui/textarea-enhanced';
import {
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  FileText,
  Video,
} from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Support</h1>
        <p className="text-slate-600 mt-2">
          Get help and support for your Rensto agents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rensto-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <CardTitle>Live Chat</CardTitle>
            </div>
            <CardDescription>Chat with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="renstoPrimary" className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6 text-green-600" />
              <CardTitle>Email Support</CardTitle>
            </div>
            <CardDescription>Send us an email</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Phone className="h-6 w-6 text-orange-600" />
              <CardTitle>Phone Support</CardTitle>
            </div>
            <CardDescription>Call us directly</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Call Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rensto-card">
          <CardHeader>
            <CardTitle>Submit a Ticket</CardTitle>
            <CardDescription>Create a support ticket for your issue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="Brief description of your issue" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Please describe your issue in detail..."
                rows={4}
              />
            </div>
            <Button variant="renstoPrimary">Submit Ticket</Button>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardHeader>
            <CardTitle>Help Resources</CardTitle>
            <CardDescription>Self-service help and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Documentation</p>
                <p className="text-sm text-slate-600">Complete guides and tutorials</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <Video className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Video Tutorials</p>
                <p className="text-sm text-slate-600">Step-by-step video guides</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <HelpCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">FAQ</p>
                <p className="text-sm text-slate-600">Frequently asked questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
