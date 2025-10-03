'use client';

import { useState, useEffect } from 'react';
import RealtimeDataHandlers from '../../services/realtime-handlers';

export default function RealtimeAdminDashboard() {
  const [data, setData] = useState({
    workflows: [],
    customers: [],
    mcpServers: [],
    systemHealth: {},
    revenue: {}
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handlers = new RealtimeDataHandlers();
    
    // Listen for real-time updates
    const handleRealtimeUpdate = (event) => {
      const { type, data: newData } = event.detail;
      setData(prev => ({
        ...prev,
        [type]: newData
      }));
    };

    window.addEventListener('realtimeUpdate', handleRealtimeUpdate);
    
    // Connect to WebSocket
    handlers.connect();
    setIsConnected(true);

    // Load initial data
    setData({
      workflows: handlers.getData('workflows') || [],
      customers: handlers.getData('customers') || [],
      mcpServers: handlers.getData('mcpServers') || [],
      systemHealth: handlers.getData('systemHealth') || {},
      revenue: handlers.getData('revenue') || {}
    });

    return () => {
      window.removeEventListener('realtimeUpdate', handleRealtimeUpdate);
      handlers.disconnect();
    };
  }, []);

  return (
    <div className="realtime-admin-dashboard">
      <div className="connection-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="workflow-status">
          <h3>Active Workflows</h3>
          <div className="workflow-list">
            {data.workflows.map(workflow => (
              <div key={workflow.id} className="workflow-item">
                <span className="workflow-name">{workflow.name}</span>
                <span className={`workflow-status ${workflow.status}`}>
                  {workflow.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="customer-status">
          <h3>Customer Status</h3>
          <div className="customer-list">
            {data.customers.map(customer => (
              <div key={customer.id} className="customer-item">
                <span className="customer-name">{customer.name}</span>
                <span className={`customer-status ${customer.status}`}>
                  {customer.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mcp-servers">
          <h3>MCP Servers</h3>
          <div className="server-list">
            {data.mcpServers.map(server => (
              <div key={server.name} className="server-item">
                <span className="server-name">{server.name}</span>
                <span className={`server-status ${server.status}`}>
                  {server.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="system-health">
          <h3>System Health</h3>
          <div className="health-metrics">
            <div className="metric">
              <span>Uptime: {data.systemHealth.uptime || 'N/A'}</span>
            </div>
            <div className="metric">
              <span>CPU: {data.systemHealth.cpu || 'N/A'}%</span>
            </div>
            <div className="metric">
              <span>Memory: {data.systemHealth.memory || 'N/A'}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
