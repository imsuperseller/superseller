'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'support' | 'analyst';
  permissions: string[];
  lastLogin: Date;
}

interface AdminPermissions {
  canViewCustomers: boolean;
  canEditCustomers: boolean;
  canViewRevenue: boolean;
  canEditBilling: boolean;
  canViewSystem: boolean;
  canManageWorkflows: boolean;
}

interface AdminContextType {
  user: AdminUser | null;
  permissions: AdminPermissions | null;
  loading: boolean;
  refreshUser: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      
      // Mock user data - replace with actual API call
      const mockUser: AdminUser = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@rensto.com',
        role: 'admin',
        permissions: ['all'],
        lastLogin: new Date(),
      };

      const mockPermissions: AdminPermissions = {
        canViewCustomers: true,
        canEditCustomers: true,
        canViewRevenue: true,
        canEditBilling: true,
        canViewSystem: true,
        canManageWorkflows: true,
      };

      setUser(mockUser);
      setPermissions(mockPermissions);
    } catch (error) {
      console.error('Failed to fetch admin user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = () => {
    fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value: AdminContextType = {
    user,
    permissions,
    loading,
    refreshUser,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
