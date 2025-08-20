import React from 'react';

export default function CustomerPortal({ params }: { params: { slug: string } }) {
  const customerId = params.slug;
  
  const customerData = {
    'ben-ginati': {
      name: 'Ben Ginati',
      company: 'Tax4Us',
      description: 'Tax services automation portal'
    },
    'shelly-mizrahi': {
      name: 'Shelly Mizrahi', 
      company: 'Insurance Services',
      description: 'Insurance services automation portal'
    }
  };

  const customer = customerData[customerId as keyof typeof customerData] || {
    name: 'Customer',
    company: 'Company',
    description: 'Business automation portal'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">{customer.name}</h1>
          <p className="text-xl text-cyan-300">{customer.company}</p>
          <p className="text-gray-300 mt-2">{customer.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Dashboard</h3>
            <p className="text-gray-300">Welcome to your business automation portal</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Tasks</h3>
            <p className="text-gray-300">Manage your automation tasks</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Analytics</h3>
            <p className="text-gray-300">View your business metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
