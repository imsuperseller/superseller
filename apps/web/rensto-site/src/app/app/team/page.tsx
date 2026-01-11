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
  Trash2,
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
          <h1 className="text-3xl font-bold text-rensto-text-primary">Team Management</h1>
          <p className="text-rensto-text-secondary mt-2">
            Manage your team members and their permissions
          </p>
        </div>
        <Button variant="renstoPrimary">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-rensto-text-secondary">Total Members</p>
                <p className="text-2xl font-bold text-rensto-text-primary">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-rensto-text-secondary">Active Members</p>
                <p className="text-2xl font-bold text-rensto-text-primary">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="renstoNeon" className="rensto-card-neon">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Settings className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-rensto-text-secondary">Roles</p>
                <p className="text-2xl font-bold text-rensto-text-primary">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="renstoNeon" className="rensto-card-neon">
        <CardHeader>
          <CardTitle className="text-rensto-text-primary">Team Members</CardTitle>
          <CardDescription className="text-rensto-text-secondary">
            Manage your team members and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-rensto-cyan/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10 border-2 border-white/10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-rensto-cyan text-slate-900 font-bold">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-rensto-text-primary">{member.name}</p>
                      {getRoleBadge(member.role)}
                      {getStatusBadge(member.status)}
                    </div>
                    <p className="text-sm text-rensto-text-secondary">{member.email}</p>
                    <p className="text-xs text-rensto-text-tertiary">Last active: {member.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="renstoSecondary" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="renstoSecondary" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="renstoGhost" size="sm" className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
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
