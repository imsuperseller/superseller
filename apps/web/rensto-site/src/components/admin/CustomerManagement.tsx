import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Customer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  successScore: number;
  lastActivity: string;
  billingStatus: 'paid' | 'pending' | 'overdue';
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'ben-ginati',
      name: 'Ben Ginati',
      email: 'ben@example.com',
      status: 'active',
      successScore: 85,
      lastActivity: '2025-08-18T17:30:00Z',
      billingStatus: 'paid'
    },
    {
      id: 'shelly-mizrahi',
      name: 'Shelly Mizrahi',
      email: 'shelly@example.com',
      status: 'active',
      successScore: 92,
      lastActivity: '2025-08-18T17:25:00Z',
      billingStatus: 'paid'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getBillingColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewCustomerPortal = (customerId: string) => {
    console.log(`Viewing portal for ${customerId}...`);
    // Implementation for viewing customer portal
  };

  const viewBilling = (customerId: string) => {
    console.log(`Viewing billing for ${customerId}...`);
    // Implementation for viewing billing
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
        <Button>Add New Customer</Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {customer.name}
                <Badge className={getStatusColor(customer.status)}>
                  {customer.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div>Email: {customer.email}</div>
                <div>Success Score: {customer.successScore}%</div>
                <div>Last Activity: {new Date(customer.lastActivity).toLocaleString()}</div>
                <div className="flex items-center space-x-2">
                  <span>Billing:</span>
                  <Badge className={getBillingColor(customer.billingStatus)}>
                    {customer.billingStatus}
                  </Badge>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => viewCustomerPortal(customer.id)}>
                  View Portal
                </Button>
                <Button size="sm" variant="outline" onClick={() => viewBilling(customer.id)}>
                  View Billing
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}