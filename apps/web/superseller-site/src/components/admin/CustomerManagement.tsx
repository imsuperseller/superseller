'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input-enhanced';

interface CustomerService {
  id: string;
  productName: string | null;
  status: string;
  type: string | null;
  activatedAt: string | null;
}

interface Customer {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: any;
  createdAt: string;
  userCount: number;
  leadCount: number;
  emails: string[];
  brand: { name: string; slug: string; logoUrl: string | null } | null;
  services: CustomerService[];
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setCustomers(json.customers || []);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'inactive': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'pending': case 'pending_setup': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'running': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending_setup': case 'setup': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'paused': case 'stopped': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.emails.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && customers.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Customer Management</h2>
        <div className="text-slate-400 animate-pulse">Loading customers from database...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Customer Management</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
            {customers.length} tenant{customers.length !== 1 ? 's' : ''} in database
          </p>
        </div>
        <button onClick={fetchData} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all">
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search by name, slug, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Tenants</p>
            <p className="text-2xl font-black text-white">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Active</p>
            <p className="text-2xl font-black text-green-400">{customers.filter(c => c.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Users</p>
            <p className="text-2xl font-black text-cyan-400">{customers.reduce((sum, c) => sum + c.userCount, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Leads</p>
            <p className="text-2xl font-black text-orange-400">{customers.reduce((sum, c) => sum + c.leadCount, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="border-white/5 hover:border-white/10 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {customer.brand?.logoUrl && (
                    <img src={customer.brand.logoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                  )}
                  <span className="truncate">{customer.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border whitespace-nowrap ${getStatusColor(customer.status)}`}>
                  {customer.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Slug:</span>
                  <span className="text-white font-mono text-xs">{customer.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Users:</span>
                  <span className="text-white">{customer.userCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Leads:</span>
                  <span className="text-white">{customer.leadCount}</span>
                </div>
                {customer.emails.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-white text-xs truncate max-w-[180px]">{customer.emails[0]}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Created:</span>
                  <span className="text-white text-xs">{new Date(customer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Services */}
              {customer.services.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Services ({customer.services.length})</p>
                  <div className="space-y-1">
                    {customer.services.slice(0, 3).map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <span className="text-xs text-white truncate max-w-[140px]">{svc.productName || svc.type || 'Service'}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getServiceStatusColor(svc.status)}`}>
                          {svc.status}
                        </span>
                      </div>
                    ))}
                    {customer.services.length > 3 && (
                      <p className="text-[10px] text-slate-500">+{customer.services.length - 3} more</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-500">
          {searchTerm ? `No customers matching "${searchTerm}"` : 'No tenants found in database'}
        </div>
      )}
    </div>
  );
}
