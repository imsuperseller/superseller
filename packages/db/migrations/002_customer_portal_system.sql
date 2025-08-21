-- Customer Portal System Database Schema
-- Extends the Zero-Dupes architecture for AI-powered customer portals

-- Customer portal data
CREATE TABLE customer_portals (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  customer_rgid TEXT REFERENCES customers(rgid),
  portal_url TEXT UNIQUE NOT NULL,
  interface_language TEXT DEFAULT 'en',
  theme_preferences JSONB DEFAULT '{}',
  onboarding_status TEXT DEFAULT 'pending',
  chat_agent_context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent (workflow) assignments to customers
CREATE TABLE customer_agents (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  customer_rgid TEXT REFERENCES customers(rgid),
  agent_type TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  n8n_workflow_id TEXT,
  n8n_workflow_url TEXT,
  status TEXT DEFAULT 'pending',
  credentials_status TEXT DEFAULT 'incomplete',
  configuration JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Typeform responses and assessments
CREATE TABLE customer_assessments (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  customer_rgid TEXT REFERENCES customers(rgid),
  typeform_response JSONB NOT NULL,
  ai_analysis JSONB,
  market_research JSONB,
  generated_plan JSONB,
  status TEXT DEFAULT 'pending',
  assessment_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer credentials and integrations
CREATE TABLE customer_credentials (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  customer_rgid TEXT REFERENCES customers(rgid),
  service_name TEXT NOT NULL,
  credential_type TEXT NOT NULL,
  encrypted_credentials JSONB NOT NULL,
  is_valid BOOLEAN DEFAULT false,
  last_validated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent recommendations and suggestions
CREATE TABLE agent_recommendations (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  customer_rgid TEXT REFERENCES customers(rgid),
  agent_type TEXT NOT NULL,
  recommendation_reason TEXT,
  priority INTEGER DEFAULT 1,
  is_visible BOOLEAN DEFAULT true,
  ai_confidence DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customer portal status tracking
CREATE TABLE portal_status_updates (
  id SERIAL PRIMARY KEY,
  customer_rgid TEXT REFERENCES customers(rgid),
  status_type TEXT NOT NULL, -- 'offer', 'payment', 'workflow', 'credential'
  status_value TEXT NOT NULL,
  message TEXT,
  requires_action BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Affiliate tracking and commissions
CREATE TABLE affiliate_opportunities (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  customer_rgid TEXT REFERENCES customers(rgid),
  agent_rgid TEXT REFERENCES customer_agents(rgid),
  affiliate_provider TEXT NOT NULL,
  affiliate_program TEXT NOT NULL,
  commission_rate DECIMAL(5,4),
  potential_commission DECIMAL(10,2),
  is_implemented BOOLEAN DEFAULT false,
  implementation_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer portal analytics
CREATE TABLE portal_analytics (
  id SERIAL PRIMARY KEY,
  customer_rgid TEXT REFERENCES customers(rgid),
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI agent conversation history
CREATE TABLE chat_agent_conversations (
  id SERIAL PRIMARY KEY,
  customer_rgid TEXT REFERENCES customers(rgid),
  session_id TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'user', 'agent', 'system'
  message_content TEXT NOT NULL,
  context_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customer portal customization
CREATE TABLE portal_customizations (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  customer_rgid TEXT REFERENCES customers(rgid),
  customization_type TEXT NOT NULL, -- 'layout', 'theme', 'features'
  customization_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow deployment tracking
CREATE TABLE workflow_deployments (
  rgid TEXT PRIMARY KEY REFERENCES entities(rgid),
  customer_rgid TEXT REFERENCES customers(rgid),
  agent_rgid TEXT REFERENCES customer_agents(rgid),
  n8n_instance_url TEXT NOT NULL,
  deployment_status TEXT DEFAULT 'pending',
  deployment_log JSONB,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_customer_portals_customer ON customer_portals(customer_rgid);
CREATE INDEX idx_customer_agents_customer ON customer_agents(customer_rgid);
CREATE INDEX idx_customer_agents_status ON customer_agents(status);
CREATE INDEX idx_customer_assessments_customer ON customer_assessments(customer_rgid);
CREATE INDEX idx_customer_assessments_status ON customer_assessments(status);
CREATE INDEX idx_customer_credentials_customer ON customer_credentials(customer_rgid);
CREATE INDEX idx_customer_credentials_service ON customer_credentials(service_name);
CREATE INDEX idx_agent_recommendations_customer ON agent_recommendations(customer_rgid);
CREATE INDEX idx_agent_recommendations_visible ON agent_recommendations(is_visible);
CREATE INDEX idx_portal_status_customer ON portal_status_updates(customer_rgid);
CREATE INDEX idx_portal_status_type ON portal_status_updates(status_type);
CREATE INDEX idx_affiliate_opportunities_customer ON affiliate_opportunities(customer_rgid);
CREATE INDEX idx_affiliate_opportunities_provider ON affiliate_opportunities(affiliate_provider);
CREATE INDEX idx_portal_analytics_customer ON portal_analytics(customer_rgid);
CREATE INDEX idx_portal_analytics_event ON portal_analytics(event_type);
CREATE INDEX idx_chat_conversations_customer ON chat_agent_conversations(customer_rgid);
CREATE INDEX idx_chat_conversations_session ON chat_agent_conversations(session_id);
CREATE INDEX idx_portal_customizations_customer ON portal_customizations(customer_rgid);
CREATE INDEX idx_workflow_deployments_customer ON workflow_deployments(customer_rgid);
CREATE INDEX idx_workflow_deployments_status ON workflow_deployments(deployment_status);

-- Add updated_at triggers
CREATE TRIGGER update_customer_portals_updated_at BEFORE UPDATE ON customer_portals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_agents_updated_at BEFORE UPDATE ON customer_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_assessments_updated_at BEFORE UPDATE ON customer_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_credentials_updated_at BEFORE UPDATE ON customer_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_opportunities_updated_at BEFORE UPDATE ON affiliate_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portal_customizations_updated_at BEFORE UPDATE ON portal_customizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_deployments_updated_at BEFORE UPDATE ON workflow_deployments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default entities for system configuration
INSERT INTO entities (rgid, kind, slug) VALUES 
  ('portal_system_config', 'system', 'portal-system-config'),
  ('ai_analysis_agent', 'agent', 'ai-analysis-agent'),
  ('market_research_agent', 'agent', 'market-research-agent'),
  ('plan_generation_agent', 'agent', 'plan-generation-agent'),
  ('chat_assistant_agent', 'agent', 'chat-assistant-agent')
ON CONFLICT (kind, slug) DO NOTHING;
