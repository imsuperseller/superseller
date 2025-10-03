// Real-time Data Handlers for Admin Dashboard
import AdminDashboardWebSocket from './websocket';

class RealtimeDataHandlers {
  constructor() {
    this.ws = new AdminDashboardWebSocket();
    this.data = {
      workflows: [],
      customers: [],
      mcpServers: [],
      systemHealth: {},
      revenue: {}
    };
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.ws.on('workflowUpdate', (data) => {
      this.updateWorkflowData(data);
    });

    this.ws.on('customerUpdate', (data) => {
      this.updateCustomerData(data);
    });

    this.ws.on('mcpServerUpdate', (data) => {
      this.updateMCPServerData(data);
    });

    this.ws.on('systemHealth', (data) => {
      this.updateSystemHealth(data);
    });

    this.ws.on('revenueUpdate', (data) => {
      this.updateRevenueData(data);
    });
  }

  updateWorkflowData(data) {
    const index = this.data.workflows.findIndex(w => w.id === data.id);
    if (index >= 0) {
      this.data.workflows[index] = { ...this.data.workflows[index], ...data };
    } else {
      this.data.workflows.push(data);
    }
    this.notifyListeners('workflows', this.data.workflows);
  }

  updateCustomerData(data) {
    const index = this.data.customers.findIndex(c => c.id === data.id);
    if (index >= 0) {
      this.data.customers[index] = { ...this.data.customers[index], ...data };
    } else {
      this.data.customers.push(data);
    }
    this.notifyListeners('customers', this.data.customers);
  }

  updateMCPServerData(data) {
    const index = this.data.mcpServers.findIndex(s => s.name === data.name);
    if (index >= 0) {
      this.data.mcpServers[index] = { ...this.data.mcpServers[index], ...data };
    } else {
      this.data.mcpServers.push(data);
    }
    this.notifyListeners('mcpServers', this.data.mcpServers);
  }

  updateSystemHealth(data) {
    this.data.systemHealth = { ...this.data.systemHealth, ...data };
    this.notifyListeners('systemHealth', this.data.systemHealth);
  }

  updateRevenueData(data) {
    this.data.revenue = { ...this.data.revenue, ...data };
    this.notifyListeners('revenue', this.data.revenue);
  }

  notifyListeners(type, data) {
    // Emit to React components
    window.dispatchEvent(new CustomEvent('realtimeUpdate', {
      detail: { type, data }
    }));
  }

  connect() {
    this.ws.connect();
  }

  disconnect() {
    this.ws.disconnect();
  }

  getData(type) {
    return this.data[type] || null;
  }
}

export default RealtimeDataHandlers;
