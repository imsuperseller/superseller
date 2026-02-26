'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  DollarSign,
  Receipt,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Send,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  organizationId: string;
  organization?: {
    name: string;
    subscription: string;
    status: string;
  };
}

interface Invoice {
  _id: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  issuedDate: string;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function BillingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBillingData = async () => {
    try {
      setLoading(true);

      // Fetch customers
      const customersResponse = await fetch('/api/users');
      const customersData = await customersResponse.json();

      // Fetch organizations
      const orgsResponse = await fetch('/api/organizations');
      const orgsData = await orgsResponse.json();

      // Combine data
      const enrichedCustomers = customersData.map((customer: Customer) => {
        const org = orgsData.find((o: unknown) => o._id === customer.organizationId);
        return {
          ...customer,
          organization: org
        };
      });

      setCustomers(enrichedCustomers);

      // Mock invoices data
      const mockInvoices: Invoice[] = [
        {
          _id: '1',
          customerId: enrichedCustomers[0]?._id || '',
          customerName: 'Ortal Flanary',
          amount: 299.00,
          status: 'paid',
          dueDate: '2025-01-15',
          issuedDate: '2025-01-01',
          description: 'Pro Subscription - January 2025',
          items: [
            { name: 'Pro Plan', quantity: 1, price: 299.00 }
          ]
        },
        {
          _id: '2',
          customerId: enrichedCustomers[1]?._id || '',
          customerName: 'Customer B',
          amount: 250.00,
          status: 'paid',
          dueDate: '2025-01-15',
          issuedDate: '2025-01-01',
          description: 'Pro Subscription - January 2025',
          items: [
            { name: 'Pro Plan', quantity: 1, price: 250.00 }
          ]
        }
      ];

      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-600';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <Trash2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  useEffect(() => {
    fetchBillingData();
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

  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue');

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-600 mt-2">Manage customer subscriptions, invoices, and payments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={fetchBillingData}>
            <TrendingUp className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              Paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(paidInvoices.reduce((sum, inv) => sum + inv.amount, 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices.length + overdueInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency((pendingInvoices.concat(overdueInvoices)).reduce((sum, inv) => sum + inv.amount, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Subscriptions ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {customer.organization && (
                        <Badge variant="outline">
                          <Building className="h-3 w-3 mr-1" />
                          {customer.organization.name}
                        </Badge>
                      )}
                      {customer.organization?.subscription && (
                        <Badge className="bg-blue-100 style={{ color: 'var(--superseller-blue)' }}">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {customer.organization.subscription}
                        </Badge>
                      )}
                      <Badge className={getStatusColor(customer.organization?.status || 'active')}>
                        {customer.organization?.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>

                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>

                  <Button size="sm" className="flex items-center gap-1">
                    <Receipt className="h-4 w-4" />
                    Invoice
                  </Button>
                </div>
              </div>
            ))}

            {customers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No customers found. Add your first customer to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recent Invoices ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">📄</div>
                  <div>
                    <h3 className="font-semibold">{invoice.customerName}</h3>
                    <p className="text-sm text-gray-600">{invoice.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(invoice.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </div>
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>

                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>

                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            ))}

            {invoices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No invoices found. Create your first invoice to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 style={{ color: 'var(--superseller-blue)' }}" />
                <h4 className="font-semibold">Stripe</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">Credit card processing</p>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">PayPal</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">Digital payments</p>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <h4 className="font-semibold">QuickBooks</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">Invoice management</p>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
