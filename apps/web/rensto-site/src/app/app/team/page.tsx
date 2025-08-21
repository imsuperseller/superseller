'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar-enhanced';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Settings,
  Shield,
} from 'lucide-react';

const mockTeamMembers = [
  {
    id: '1',
    name: 'Ben Ginati',
    email: 'ben@tax4us.co.il',
    role: 'Owner',
    avatar: '/avatars/ben.jpg',
    status: 'active',
    lastActive: '2 minutes ago',
  },
  {
    id: '2',
    name: 'Sarah Cohen',
    email: 'sarah@tax4us.co.il',
    role: 'Manager',
    avatar: '/avatars/sarah.jpg',
    status: 'active',
    lastActive: '1 hour ago',
  },
  {
    id: '3',
    name: 'David Levy',
    email: 'david@tax4us.co.il',
    role: 'Member',
    avatar: '/avatars/david.jpg',
    status: 'inactive',
    lastActive: '3 days ago',
  },
];

export default function TeamPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="renstoSuccess">Active</Badge>;
      case 'inactive':
        return <Badge variant="renstoSecondary">Inactive</Badge>;
      default:
        return <Badge variant="renstoSecondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Owner':
        return <Badge variant="renstoError">{role}</Badge>;
      case 'Manager':
        return <Badge variant="renstoWarning">{role}</Badge>;
      case 'Member':
        return <Badge variant="renstoSecondary">{role}</Badge>;
      default:
        return <Badge variant="renstoSecondary">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-600 mt-2">
            Manage your team members and their permissions
          </p>
        </div>
        <Button variant="renstoPrimary">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Members</p>
                <p className="text-2xl font-bold text-slate-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Active Members</p>
                <p className="text-2xl font-bold text-slate-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rensto-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Roles</p>
                <p className="text-2xl font-bold text-slate-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rensto-card">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-slate-900">{member.name}</p>
                      {getRoleBadge(member.role)}
                      {getStatusBadge(member.status)}
                    </div>
                    <p className="text-sm text-slate-600">{member.email}</p>
                    <p className="text-xs text-slate-500">Last active: {member.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
