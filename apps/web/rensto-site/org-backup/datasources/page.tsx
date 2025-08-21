import { Plus, CheckCircle, XCircle, RefreshCw, Settings } from 'lucide-react';

interface DataSourcesPageProps {
  params: Promise<{ org: string }>;
}

const dataSourceTypes = [
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'Connect your MongoDB databases for data management',
    icon: '📊',
    status: 'connected',
    lastSync: '5 minutes ago',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscription management',
    icon: '💳',
    status: 'connected',
    lastSync: '2 minutes ago',
  },
  {
    id: 'typeform',
    name: 'Typeform',
    description: 'Form responses and lead generation',
    icon: '📝',
    status: 'connected',
    lastSync: '1 hour ago',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and financial data',
    icon: '📈',
    status: 'disconnected',
    lastSync: '3 days ago',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repository management and webhooks',
    icon: '🐙',
    status: 'disconnected',
    lastSync: 'Never',
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    description: 'Connect any external service via webhooks',
    icon: '🔗',
    status: 'disconnected',
    lastSync: 'Never',
  },
];

export default async function DataSourcesPage({ params }: DataSourcesPageProps) {
  await params; // Use params to avoid unused variable warning

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 rensto-animate-glow" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Sources</h1>
          <p className="text-slate-600 mt-1">
            Connect your external services and data sources.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Data Source</span>
          </button>
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataSourceTypes.map(source => (
          <div
            key={source.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{source.icon}</span>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {source.name}
                  </h4>
                  <p className="text-sm text-slate-500">{source.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                    source.status
                  )}`}
                >
                  {getStatusIcon(source.status)}
                  <span>{source.status}</span>
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-slate-500">
                Last sync: {source.lastSync}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {source.status === 'connected' ? (
                <>
                  <button className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900">
                    <RefreshCw className="w-4 h-4" />
                    <span>Sync Now</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900">
                    <Settings className="w-4 h-4" />
                    <span>Configure</span>
                  </button>
                </>
              ) : (
                <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Connect {source.name}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connection Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold style={{ color: 'var(--rensto-blue)' }} mb-2">
          Need help connecting?
        </h3>
        <p className="style={{ color: 'var(--rensto-blue)' }} mb-4">
          Each data source requires specific API keys and configuration. Follow
          our step-by-step guides to get started.
        </p>
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            View Documentation
          </button>
          <button className="style={{ color: 'var(--rensto-blue)' }} hover:style={{ color: 'var(--rensto-blue)' }} transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
