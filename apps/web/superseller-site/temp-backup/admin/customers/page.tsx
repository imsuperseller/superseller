'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ExternalLink, 
  MessageSquare, 
  Settings, 
  Eye, 
  Plus,
  Mail,
  Building,
  DollarSign,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  organizationId: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  organization?: {
    name: string;
    slug: string;
    domain: string;
    industry: string;
    businessSize: string;
    subscription: string;
    status: string;
  };
  agents?: Array<{
    _id: string;
    name: string;
    status: string;
    lastRun?: string;
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Fetch customers
      const customersResponse = await fetch('/api/users');
      const customersData = await customersResponse.json();
      
      // Fetch organizations
      const orgsResponse = await fetch('/api/organizations');
      const orgsData = await orgsResponse.json();
      
      // Fetch agents
      const agentsResponse = await fetch('/api/agents');
      const agentsData = await agentsResponse.json();
      
      // Combine data
      const enrichedCustomers = customersData.map((customer: Customer) => {
        const org = orgsData.find((o: unknown) => o._id === customer.organizationId);
        const customerAgents = agentsData.filter((a: unknown) => a.organizationId === customer.organizationId);
        
        return {
          ...customer,
          organization: org,
          agents: customerAgents
        };
      });
      
      setCustomers(enrichedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = (customer: Customer) => {
    if (customer.organization?.slug) {
      window.open(`/portal/${customer.organization.slug}`, '_blank');
    }
  };

  const sendCustomerEmail = (customer: Customer) => {
    window.open(`mailto:${customer.email}?subject=SuperSeller AI Support`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-superseller-card text-superseller-text';
      case 'suspended': return 'bg-red-100 text-red-600';
      default: return 'bg-superseller-card text-superseller-text';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="superseller-animate-glow rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-superseller-text flex items-center gap-3"><div className="w-6 h-6 relative">
                <Image
                  src="/SuperSeller AI Logo.png"
                  alt="SuperSeller AI Logo"
                  width={24}
                  height={24}
                  className="superseller-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
                />
              </div>Customer Management</h1>
          <p className="text-superseller-text/70 mt-2">Manage customer accounts, portals, and support</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={fetchCustomers}>
            <Activity className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="supersellerPrimary" className="flex items-center gap-2 superseller-button">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.organization?.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.reduce((sum, c) => sum + (c.agents?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Deployed agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Open tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Accounts ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer._id} className="flex items-center justify-between p-6 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <p className="text-sm text-superseller-text/70">{customer.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(customer.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(customer.status)}
                          {customer.status}
                        </div>
                      </Badge>
                      {customer.organization && (
                        <Badge variant="outline">
                          <Building className="h-3 w-3 mr-1" />
                          {customer.organization.name}
                        </Badge>
                      )}
                      {customer.organization?.subscription && (
                        <Badge variant="outline">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {customer.organization.subscription}
                        </Badge>
                      )}
                    </div>
                    {customer.agents && customer.agents.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-superseller-text/60">
                          Agents: {customer.agents.map(a => a.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => openCustomerPortal(customer)}
                    className="flex items-center gap-1"
                    disabled={!customer.organization?.slug}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Portal
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendCustomerEmail(customer)}
                    className="flex items-center gap-1"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCustomer(customer)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Settings className="h-4 w-4" />
                    Config
                  </Button>
                </div>
              </div>
            ))}
            
            {customers.length === 0 && (
              <div className="text-center py-8 text-superseller-text/60">
                No customers found. Add your first customer to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-superseller-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Customer Details</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-superseller-text">Personal Information</h3>
                <div className="mt-2 space-y-2">
                  <p><strong>Name:</strong> {selectedCustomer.name}</p>
                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                  <p><strong>Role:</strong> {selectedCustomer.role}</p>
                  <p><strong>Status:</strong> {selectedCustomer.status}</p>
                  <p><strong>Created:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {selectedCustomer.organization && (
                <div>
                  <h3 className="font-medium text-superseller-text">Organization</h3>
                  <div className="mt-2 space-y-2">
                    <p><strong>Name:</strong> {selectedCustomer.organization.name}</p>
                    <p><strong>Domain:</strong> {selectedCustomer.organization.domain}</p>
                    <p><strong>Industry:</strong> {selectedCustomer.organization.industry}</p>
                    <p><strong>Size:</strong> {selectedCustomer.organization.businessSize}</p>
                    <p><strong>Subscription:</strong> {selectedCustomer.organization.subscription}</p>
                    <p><strong>Status:</strong> {selectedCustomer.organization.status}</p>
                  </div>
                </div>
              )}
              
              {selectedCustomer.agents && selectedCustomer.agents.length > 0 && (
                <div>
                  <h3 className="font-medium text-superseller-text">Agents</h3>
                  <div className="mt-2 space-y-2">
                    {selectedCustomer.agents.map((agent) => (
                      <div key={agent._id} className="flex items-center justify-between p-2 bg-superseller-background rounded">
                        <span>{agent.name}</span>
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => openCustomerPortal(selectedCustomer)}
                  disabled={!selectedCustomer.organization?.slug}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Portal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendCustomerEmail(selectedCustomer)}
                  className="flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
