'use client';

import { useState, useEffect } from 'react';

interface Credential {
  name: string;
  type: string;
  description: string;
  required: boolean;
  missing: boolean;
  value?: string;
}

interface IntegrationStatus {
  status: string;
  missing_components: string[];
}

export default function ShellyCredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatAgent, setChatAgent] = useState<{
    helpWithCredentials: (credentialName: string) => Promise<{
      title: string;
      steps: string[];
      example: Record<string, unknown>;
    }>;
  } | null>(null);

  useEffect(() => {
    loadIntegrationStatus();
    initializeChatAgent();
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/customers/shelly-mizrahi/integration-status');
      const data = await response.json();
      
      setCredentials(data.credentials || []);
      setIntegrationStatus(data.integration);
    } catch (error) {
      console.error('Failed to load integration status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeChatAgent = () => {
    // Initialize chat agent for helping with missing credentials
    const agent = {
      helpWithCredentials: async (credentialName: string) => {
        const helpMessages = {
          'excel-processing-api': {
            title: 'Excel Processing API Setup',
            steps: [
              '1. Contact your Excel processing service provider',
              '2. Request API credentials (API key and endpoint)',
              '3. Enter the credentials in the form below',
              '4. Test the connection'
            ],
            example: {
              apiKey: 'your-api-key-here',
              endpoint: 'https://api.excel-processor.com/v1'
            }
          },
          'file-storage-service': {
            title: 'AWS S3 File Storage Setup',
            steps: [
              '1. Create an AWS S3 bucket for file storage',
              '2. Generate AWS access keys',
              '3. Configure bucket permissions',
              '4. Enter the credentials below'
            ],
            example: {
              accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
              secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
              region: 'us-east-1',
              bucket: 'shelly-excel-files'
            }
          },
          'email-service': {
            title: 'Email Service Setup (Optional)',
            steps: [
              '1. Choose an email service provider (Gmail, Outlook, etc.)',
              '2. Enable 2-factor authentication',
              '3. Generate an app password',
              '4. Enter SMTP settings below'
            ],
            example: {
              host: 'smtp.gmail.com',
              port: 587,
              username: 'shellypensia@gmail.com',
              password: 'your-app-password'
            }
          }
        };

        return helpMessages[credentialName] || {
          title: 'General Setup',
          steps: ['Please contact support for assistance with this credential type.'],
          example: {}
        };
      }
    };

    setChatAgent(agent);
  };

  const handleCredentialSubmit = async (credentialName: string, values: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/customers/shelly-mizrahi/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialName,
          values
        })
      });

      if (response.ok) {
        // Refresh credentials list
        await loadIntegrationStatus();
        alert('Credential saved successfully!');
      } else {
        throw new Error('Failed to save credential');
      }
    } catch (error) {
      console.error('Error saving credential:', error);
      alert('Failed to save credential. Please try again.');
    }
  };

  const testWorkflow = async () => {
    try {
      const response = await fetch('/api/n8n/workflows/shelly-excel-processor/test', {
        method: 'POST'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Workflow test successful! All credentials are working.');
      } else {
        alert(`Workflow test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Workflow test error:', error);
      alert('Failed to test workflow. Please check your credentials.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-orange-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading integration status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-orange-600">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Integration Setup</h1>
          <p className="text-xl style={{ color: 'var(--rensto-blue)' }}">Complete your n8n workflow setup</p>
        </div>

        {/* Integration Status */}
        {integrationStatus && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Integration Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className={`p-4 rounded-lg ${integrationStatus.status === 'complete' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <h3 className="font-semibold text-gray-800">Status</h3>
                <p className={`font-bold ${integrationStatus.status === 'complete' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {integrationStatus.status === 'complete' ? '✅ Complete' : '⚠️ Setup Required'}
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800">Missing Components</h3>
                <p className="style={{ color: 'var(--rensto-blue)' }} font-bold">{integrationStatus.missing_components.length}</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800">Credentials</h3>
                <p className="text-purple-600 font-bold">{credentials.filter(c => !c.missing).length}/{credentials.length}</p>
              </div>
            </div>

            {integrationStatus.missing_components.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Missing Components:</h3>
                <ul className="list-disc list-inside text-yellow-700">
                  {integrationStatus.missing_components.map((component, index) => (
                    <li key={index}>{component}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Credentials Management */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Required Credentials</h2>
          
          <div className="space-y-6">
            {credentials.map((credential, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{credential.name}</h3>
                    <p className="text-gray-600">{credential.description}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      credential.required ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {credential.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    credential.missing ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-800'
                  }`}>
                    {credential.missing ? 'Missing' : 'Configured'}
                  </div>
                </div>

                {credential.missing && (
                  <CredentialForm 
                    credential={credential} 
                    onSubmit={handleCredentialSubmit}
                    chatAgent={chatAgent}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Test Workflow */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Test Integration</h2>
          
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h3 className="font-semibold style={{ color: 'var(--rensto-blue)' }} mb-4">Test Your Setup</h3>
            <p className="style={{ color: 'var(--rensto-blue)' }} mb-4">
              Once all required credentials are configured, you can test your Excel processing workflow.
            </p>
            
            <button
              onClick={testWorkflow}
              disabled={credentials.some(c => c.required && c.missing)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Workflow
            </button>
            
            {credentials.some(c => c.required && c.missing) && (
              <p className="style={{ color: 'var(--rensto-red)' }} mt-2 text-sm">
                Please configure all required credentials before testing.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Credential Form Component
function CredentialForm({ 
  credential, 
  onSubmit, 
  chatAgent 
}: {
  credential: Credential;
  onSubmit: (credentialName: string, values: Record<string, unknown>) => void;
  chatAgent: {
    helpWithCredentials: (credentialName: string) => Promise<{
      title: string;
      steps: string[];
      example: Record<string, unknown>;
    }>;
  } | null;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [helpInfo, setHelpInfo] = useState<{
    title: string;
    steps: string[];
    example: Record<string, unknown>;
  } | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const handleHelpClick = async () => {
    if (chatAgent) {
      const help = await chatAgent.helpWithCredentials(credential.name);
      setHelpInfo(help);
      setShowHelp(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(credential.name, formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Help Button */}
      <button
        onClick={handleHelpClick}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
      >
        🤖 Get Help from AI Assistant
      </button>

      {/* Help Modal */}
      {showHelp && helpInfo && (
        <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-semibold style={{ color: 'var(--rensto-blue)' }} mb-2">{helpInfo.title}</h4>
          <ol className="list-decimal list-inside style={{ color: 'var(--rensto-blue)' }} mb-4">
            {helpInfo.steps.map((step: string, index: number) => (
              <li key={index} className="mb-1">{step}</li>
            ))}
          </ol>
          
          {Object.keys(helpInfo.example).length > 0 && (
            <div>
              <h5 className="font-semibold style={{ color: 'var(--rensto-blue)' }} mb-2">Example Configuration:</h5>
              <pre className="bg-blue-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(helpInfo.example, null, 2)}
              </pre>
            </div>
          )}
          
          <button
            onClick={() => setShowHelp(false)}
            className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Close Help
          </button>
        </div>
      )}

      {/* Credential Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {credential.type === 'genericApi' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={formData.apiKey || ''}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your API key"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
              <input
                type="url"
                value={formData.endpoint || ''}
                onChange={(e) => handleInputChange('endpoint', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.example.com/v1"
                required
              />
            </div>
          </>
        )}

        {credential.type === 'awsS3' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Key ID</label>
              <input
                type="text"
                value={formData.accessKeyId || ''}
                onChange={(e) => handleInputChange('accessKeyId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secret Access Key</label>
              <input
                type="password"
                value={formData.secretAccessKey || ''}
                onChange={(e) => handleInputChange('secretAccessKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your secret access key"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                type="text"
                value={formData.region || ''}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="us-east-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Name</label>
              <input
                type="text"
                value={formData.bucket || ''}
                onChange={(e) => handleInputChange('bucket', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="shelly-excel-files"
                required
              />
            </div>
          </>
        )}

        {credential.type === 'smtp' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
              <input
                type="text"
                value={formData.host || ''}
                onChange={(e) => handleInputChange('host', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={formData.port || ''}
                onChange={(e) => handleInputChange('port', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="email"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="shellypensia@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your app password"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
        >
          Save Credential
        </button>
      </form>
    </div>
  );
}
