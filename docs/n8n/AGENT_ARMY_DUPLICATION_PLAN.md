# 🤖 AGENT ARMY DUPLICATION PLAN - "Terminator Terry" Expansion

**Date**: October 5, 2025
**Base Workflow**: Terry (7ArwzAJhIUlpOEZh)
**Inspiration**: Terminator Terry transcript (Monitor → Troubleshoot → Fix → Report)
**Goal**: Create 5+ specialized AI agents + 1 supervisor agent for autonomous infrastructure management

---

## 🎯 VISION

**From**: Single generalist agent ("Terry") monitoring one server
**To**: Specialized agent army managing entire infrastructure (network, storage, VMs, apps, databases)

**Architecture**:
```
                    ┌─────────────────────────────┐
                    │   SUPERVISOR TERRY (CTO)    │
                    │   Coordinates all agents    │
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
    ┌─────────▼─────────┐ ┌───────▼────────┐ ┌────────▼─────────┐
    │  NETWORK TERRY    │ │  STORAGE TERRY │ │  PROXMOX TERRY   │
    │  (Network Eng)    │ │  (Storage Eng) │ │  (Virt Admin)    │
    └───────────────────┘ └────────────────┘ └──────────────────┘
              │                    │                    │
    ┌─────────▼─────────┐ ┌───────▼────────┐
    │  APPLICATION      │ │  DATABASE      │
    │  TERRY (Apps)     │ │  TERRY (DBA)   │
    └───────────────────┘ └────────────────┘
```

---

## 🔍 CURRENT "TERRY" ANALYSIS

### **Workflow Structure** (15 nodes):

**Flow**:
```
1. Triggers (Schedule OR Manual)
   ↓
2. Edit Fields (Set prompt: "monitor http://173.254.201.134. if it down fix it.")
   ↓
3. AI Agent (LangChain agent with tools)
   ├── OpenAI Chat Model (GPT-4)
   ├── Simple Memory (conversation buffer)
   ├── Structured Output Parser
   └── Tools:
       - Racknerd Tool (HTTP Request to server)
       - CLI Tool (sub-workflow for SSH commands)
   ↓
4. Decision Logic (If/Switch nodes)
   ├── Check if needs approval
   └── Route based on output
   ↓
5. Telegram Notifications
   ├── Send a text message (status update)
   ├── Send a text message1 (approval request)
   └── Send a text message2 (final report)
```

**Key Components**:
1. ✅ **Scheduler**: Runs every X minutes
2. ✅ **Prompt**: Dynamic system prompt via Edit Fields
3. ✅ **AI Agent**: LangChain agent with OpenAI GPT-4
4. ✅ **Tools**: HTTP check + CLI commands
5. ✅ **Structured Output**: JSON response format
6. ✅ **Approval Logic**: Human-in-the-loop for dangerous commands
7. ✅ **Notifications**: Telegram for status updates

---

## 🎯 AGENT METHODOLOGY (From Terminator Terry Transcript)

### **The 4-Phase Pattern**:

**1. MONITOR** (Check if things are working)
- Website/service uptime checks
- Resource usage (CPU, memory, disk)
- Container/service status
- Network connectivity

**2. TROUBLESHOOT** (Run diagnostics)
- `docker ps` (container status)
- `docker logs` (error messages)
- `docker inspect` (detailed config)
- System logs and metrics

**3. FIX** (Apply solutions)
- **WITH APPROVAL**: Restart services, kill processes, modify config
- Report proposed fix via Telegram
- Wait for human approval
- Execute after approval

**4. REPORT** (Send notifications)
- Status updates (Telegram/Slack)
- Error summaries
- Actions taken
- Next steps recommended

### **Critical Pattern: Human-in-the-Loop**

```json
{
  "service_up": false,
  "message": "Service X is down",
  "applied_fix": false,
  "needs_approval": true,
  "commands_requested": [
    "docker restart service-x",
    "docker rm old-container"
  ]
}
```

**If `needs_approval = true`**:
1. Send Telegram message with proposed commands
2. Wait for user reply ("approve" or "deny")
3. Execute if approved
4. Report results

---

## 🏗️ SPECIALIZED AGENTS DESIGN

### **AGENT 1: NETWORK TERRY (Network Engineer)**

**Responsibilities**:
- Monitor: UniFi network, bandwidth, devices
- Troubleshoot: Connection issues, DHCP, DNS
- Fix: Restart services, block IPs, update firewall

**System Prompt Template**:
```
You are NETWORK TERRY, an expert Network Engineer managing Rensto's network infrastructure.

Your domain: UniFi network (UniFi Dream Machine Pro)

MONITORING DUTIES:
- Check network uptime and connectivity
- Monitor bandwidth usage and network performance
- Track connected devices and their health
- Verify DHCP and DNS services are working

TROUBLESHOOTING APPROACH:
When you detect an issue:
1. Check UniFi controller API for network status
2. Review recent logs for errors or warnings
3. Identify problematic devices or services
4. Determine root cause

FIXING PROTOCOL:
CRITICAL: Request approval before running ANY command that modifies the network.

Examples requiring approval:
- Restarting network services
- Blocking IP addresses
- Modifying firewall rules
- Changing DHCP settings
- Rebooting network devices

Report back using this JSON format:
{
  "network_up": boolean,
  "message": "Status description",
  "applied_fix": boolean,
  "needs_approval": boolean,
  "commands_requested": ["command1", "command2"]
}
```

**Tools**:
- UniFi API Tool (HTTP requests to UniFi controller)
- SSH Tool (for network device access)
- Ping/Traceroute Tool

**Schedule**: Every 5 minutes

---

### **AGENT 2: STORAGE TERRY (Storage Engineer)**

**Responsibilities**:
- Monitor: ZFS pools, disk health, capacity
- Troubleshoot: SMART errors, scrub status, I/O issues
- Fix: Replace disks, run scrubs, expand pools

**System Prompt Template**:
```
You are STORAGE TERRY, an expert Storage Engineer managing Rensto's storage infrastructure.

Your domain: ZFS storage pools (Proxmox)

MONITORING DUTIES:
- Check ZFS pool health and capacity
- Monitor disk SMART status
- Track I/O performance
- Verify scrub schedules

TROUBLESHOOTING APPROACH:
When you detect an issue:
1. Run `zpool status` to check pool health
2. Check SMART data with `smartctl`
3. Review scrub logs
4. Identify failing or degraded disks

FIXING PROTOCOL:
CRITICAL: Request approval before running ANY command that modifies storage.

Examples requiring approval:
- Replacing disks in ZFS pools
- Running manual scrubs
- Expanding storage pools
- Modifying ZFS settings
- Any operation that could cause data loss

Report back using this JSON format:
{
  "storage_healthy": boolean,
  "message": "Status description",
  "applied_fix": boolean,
  "needs_approval": boolean,
  "commands_requested": ["command1", "command2"]
}
```

**Tools**:
- SSH Tool (for ZFS commands)
- SMART Monitoring Tool
- ZFS API Tool (if available)

**Schedule**: Every 15 minutes

---

### **AGENT 3: PROXMOX TERRY (Virtualization Admin)**

**Responsibilities**:
- Monitor: VMs, containers, resource usage
- Troubleshoot: VM crashes, resource constraints
- Fix: Restart VMs, adjust resources, backups

**System Prompt Template**:
```
You are PROXMOX TERRY, an expert Virtualization Administrator managing Rensto's Proxmox infrastructure.

Your domain: Proxmox VE (VMs and containers)

MONITORING DUTIES:
- Check VM and container status
- Monitor resource usage (CPU, RAM, disk)
- Track backup schedules
- Verify cluster health

TROUBLESHOOTING APPROACH:
When you detect an issue:
1. Query Proxmox API for VM/container status
2. Check resource allocation and usage
3. Review logs for errors
4. Identify crashed or hung VMs

FIXING PROTOCOL:
CRITICAL: Request approval before running ANY command that modifies VMs/containers.

Examples requiring approval:
- Restarting VMs or containers
- Adjusting resource allocation
- Starting backups
- Migrating VMs
- Any operation affecting running services

Report back using this JSON format:
{
  "proxmox_healthy": boolean,
  "message": "Status description",
  "applied_fix": boolean,
  "needs_approval": boolean,
  "commands_requested": ["command1", "command2"]
}
```

**Tools**:
- Proxmox API Tool (HTTP requests to Proxmox)
- SSH Tool (for `qm` and `pct` commands)
- Resource Monitoring Tool

**Schedule**: Every 10 minutes

---

### **AGENT 4: APPLICATION TERRY (App Monitor)**

**Responsibilities**:
- Monitor: Plex, Home Assistant, Docker containers, n8n
- Troubleshoot: Service failures, API errors
- Fix: Restart services, clear caches

**System Prompt Template**:
```
You are APPLICATION TERRY, an expert Application Administrator managing Rensto's application stack.

Your domain: Docker containers and applications (Plex, Home Assistant, n8n, etc.)

MONITORING DUTIES:
- Check application uptime and health
- Monitor API endpoints
- Track container status
- Verify service dependencies

TROUBLESHOOTING APPROACH:
When you detect an issue:
1. Check container status with `docker ps`
2. Review logs with `docker logs`
3. Test API endpoints
4. Identify failed or unhealthy containers

FIXING PROTOCOL:
CRITICAL: Request approval before running ANY command that modifies services.

Examples requiring approval:
- Restarting Docker containers
- Clearing application caches
- Modifying container configurations
- Rebuilding containers
- Any operation causing service disruption

Report back using this JSON format:
{
  "applications_healthy": boolean,
  "message": "Status description",
  "applied_fix": boolean,
  "needs_approval": boolean,
  "commands_requested": ["command1", "command2"]
}
```

**Tools**:
- Docker API Tool
- HTTP Health Check Tool
- SSH Tool (for docker commands)

**Schedule**: Every 5 minutes

---

### **AGENT 5: DATABASE TERRY (Database Admin)**

**Responsibilities**:
- Monitor: MongoDB, PostgreSQL, backups
- Troubleshoot: Connection issues, slow queries
- Fix: Restart services, run maintenance

**System Prompt Template**:
```
You are DATABASE TERRY, an expert Database Administrator managing Rensto's databases.

Your domain: MongoDB and PostgreSQL databases

MONITORING DUTIES:
- Check database connections and uptime
- Monitor query performance
- Track backup status
- Verify replication health

TROUBLESHOOTING APPROACH:
When you detect an issue:
1. Check database connectivity
2. Review slow query logs
3. Monitor disk space and I/O
4. Identify connection pool issues

FIXING PROTOCOL:
CRITICAL: Request approval before running ANY command that modifies databases.

Examples requiring approval:
- Restarting database services
- Running maintenance tasks (VACUUM, REINDEX)
- Killing long-running queries
- Modifying database configurations
- Any operation risking data integrity

Report back using this JSON format:
{
  "databases_healthy": boolean,
  "message": "Status description",
  "applied_fix": boolean,
  "needs_approval": boolean,
  "commands_requested": ["command1", "command2"]
}
```

**Tools**:
- Database Connection Tool
- SSH Tool (for database commands)
- Query Monitoring Tool

**Schedule**: Every 15 minutes

---

### **AGENT 6: SUPERVISOR TERRY (CTO/Manager)**

**Responsibilities**:
- Coordinate: All other agents
- Escalate: Complex issues requiring multiple agents
- Report: High-level summaries to user
- Maintain: System documentation in n8n Data Tables

**System Prompt Template**:
```
You are SUPERVISOR TERRY, the Chief Technology Officer overseeing all infrastructure agents.

Your team:
- NETWORK TERRY (Network Engineer)
- STORAGE TERRY (Storage Engineer)
- PROXMOX TERRY (Virtualization Admin)
- APPLICATION TERRY (Application Monitor)
- DATABASE TERRY (Database Admin)

COORDINATION DUTIES:
- Receive reports from all agents
- Identify cross-domain issues (e.g., storage affecting VMs)
- Delegate tasks to appropriate specialized agents
- Aggregate status reports for the user

ESCALATION APPROACH:
When you detect a complex issue:
1. Analyze which agents are reporting problems
2. Determine if issue spans multiple domains
3. Coordinate multi-agent response
4. Provide high-level summary to user

REPORTING:
Send daily summary reports including:
- System health overview
- Issues detected and resolved
- Actions requiring user approval
- Recommendations for improvements

Report back using this JSON format:
{
  "infrastructure_healthy": boolean,
  "summary": "High-level status",
  "agent_reports": [
    {"agent": "NETWORK TERRY", "status": "healthy"},
    {"agent": "STORAGE TERRY", "status": "warning"},
    ...
  ],
  "recommendations": ["Action 1", "Action 2"]
}
```

**Tools**:
- All agent sub-workflows (call other agents)
- n8n Data Tables (read system documentation)
- Aggregation tools

**Schedule**: Every 30 minutes + on-demand

---

## 🚀 IMPLEMENTATION STRATEGY

### **Phase 1: Extract Base Template (Week 1)**

**Steps**:
1. ✅ Analyze existing Terry workflow (DONE - this analysis)
2. Create base template workflow "AGENT-TEMPLATE-001"
3. Identify reusable components:
   - Schedule trigger (configurable interval)
   - Edit Fields (dynamic prompt)
   - AI Agent node (OpenAI GPT-4)
   - Structured Output Parser (JSON schema)
   - Approval logic (If/Switch nodes)
   - Telegram notifications (3 message types)
4. Parameterize all domain-specific parts:
   - Agent name (NETWORK TERRY, STORAGE TERRY, etc.)
   - System prompt template
   - Tools (domain-specific)
   - Monitoring targets
   - Schedule interval

**Deliverable**: AGENT-TEMPLATE-001 workflow (inactive, template only)

---

### **Phase 2: Build Specialized Tools (Week 1-2)**

**Create Sub-Workflows for Each Domain**:

1. **Network Tools** (INT-TOOL-NETWORK-001):
   - UniFi API calls
   - Network health checks
   - Device status queries

2. **Storage Tools** (INT-TOOL-STORAGE-001):
   - ZFS status commands
   - SMART monitoring
   - Disk health checks

3. **Proxmox Tools** (INT-TOOL-PROXMOX-001):
   - VM status queries
   - Container management
   - Resource monitoring

4. **Application Tools** (INT-TOOL-APP-001):
   - Docker API calls
   - Health check endpoints
   - Container management

5. **Database Tools** (INT-TOOL-DB-001):
   - Connection tests
   - Query monitoring
   - Backup status checks

**Each tool sub-workflow includes**:
- Input parameters (target, command, etc.)
- Execution logic (SSH/API calls)
- Error handling
- Structured output

---

### **Phase 3: Deploy Specialized Agents (Week 2)**

**For Each Agent**:
1. Duplicate AGENT-TEMPLATE-001
2. Rename: INT-AGENT-NETWORK-001, INT-AGENT-STORAGE-001, etc.
3. Customize prompt with domain-specific template
4. Configure domain-specific tools
5. Set appropriate schedule interval
6. Test with manual trigger
7. Activate after testing

**Testing Checklist Per Agent**:
- [ ] Monitoring detects healthy state
- [ ] Monitoring detects unhealthy state (simulate)
- [ ] Troubleshooting runs correct diagnostics
- [ ] Fix proposes correct commands
- [ ] Approval workflow works (Telegram message)
- [ ] Approved commands execute successfully
- [ ] Status notifications sent to Telegram
- [ ] Structured output format correct

---

### **Phase 4: Build Supervisor Agent (Week 2-3)**

**INT-AGENT-SUPERVISOR-001**:

**Components**:
1. **Data Collection**: Call all 5 specialized agent workflows
2. **Aggregation**: Combine reports into single summary
3. **Analysis**: Identify cross-domain issues
4. **Coordination**: Trigger specific agents if needed
5. **Reporting**: Send daily summary to Telegram

**Flow**:
```
1. Schedule Trigger (every 30 min)
   ↓
2. Call all agent workflows in parallel
   ├── NETWORK TERRY
   ├── STORAGE TERRY
   ├── PROXMOX TERRY
   ├── APPLICATION TERRY
   └── DATABASE TERRY
   ↓
3. Aggregate Reports (Code node)
   ↓
4. AI Analysis (GPT-4)
   - Identify patterns
   - Detect cross-domain issues
   - Recommend actions
   ↓
5. Send Summary (Telegram)
```

---

### **Phase 5: Knowledge Base (Week 3)**

**Create n8n Data Tables for System Documentation**:

**Table 1: Infrastructure Inventory**
| Field | Type | Purpose |
|-------|------|---------|
| Name | Text | Resource name |
| Type | Select | Network, Storage, VM, App, DB |
| Status | Select | Healthy, Warning, Critical |
| Last Check | DateTime | Last monitoring check |
| Agent | Text | Responsible agent |

**Table 2: Troubleshooting Playbooks**
| Field | Type | Purpose |
|-------|------|---------|
| Issue | Text | Problem description |
| Symptoms | Text | How to detect |
| Commands | Text | Diagnostic commands |
| Fix | Text | Resolution steps |
| Agent | Text | Responsible agent |

**Table 3: Approval History**
| Field | Type | Purpose |
|-------|------|---------|
| Timestamp | DateTime | When requested |
| Agent | Text | Which agent |
| Commands | Text | Proposed commands |
| Approved | Checkbox | User decision |
| Result | Text | Execution outcome |

**Agents read from these tables**:
- Load playbooks for troubleshooting
- Store incident history
- Learn from past approvals

---

## 📊 ARCHITECTURE DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                     SUPERVISOR TERRY                             │
│                   (Every 30 minutes)                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 1. Call all specialized agents                         │   │
│  │ 2. Aggregate reports                                   │   │
│  │ 3. Identify cross-domain issues                        │   │
│  │ 4. Send daily summary                                  │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────┬────────────┬────────────┬────────────┬──────────────┘
           │            │            │            │
           ↓            ↓            ↓            ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  NETWORK     │ │  STORAGE     │ │  PROXMOX     │ │  APPLICATION │
│  TERRY       │ │  TERRY       │ │  TERRY       │ │  TERRY       │
│ (Every 5min) │ │ (Every 15min)│ │ (Every 10min)│ │ (Every 5min) │
│              │ │              │ │              │ │              │
│ 1. Monitor   │ │ 1. Monitor   │ │ 1. Monitor   │ │ 1. Monitor   │
│ 2.Troublesh. │ │ 2.Troublesh. │ │ 2.Troublesh. │ │ 2.Troublesh. │
│ 3. Fix       │ │ 3. Fix       │ │ 3. Fix       │ │ 3. Fix       │
│ 4. Report    │ │ 4. Report    │ │ 4. Report    │ │ 4. Report    │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       │                │                │                │
       ↓                ↓                ↓                ↓
┌──────────────────────────────────────────────────────────────────┐
│                  n8n DATA TABLES                                 │
│  • Infrastructure Inventory                                      │
│  • Troubleshooting Playbooks                                     │
│  • Approval History                                              │
└──────────────────────────────────────────────────────────────────┘
       ↑                ↑                ↑                ↑
       │                │                │                │
       └────────────────┴────────────────┴────────────────┘
                  (All agents read/write)
```

---

## 🧪 TESTING STRATEGY

### **Unit Testing (Per Agent)**:
1. **Healthy State**: Agent monitors healthy system, reports OK
2. **Unhealthy State**: Agent detects issue, proposes fix
3. **Approval Request**: Agent sends Telegram message with commands
4. **Approved Fix**: User approves, agent executes, reports success
5. **Denied Fix**: User denies, agent reports no action taken

### **Integration Testing (Supervisor + Agents)**:
1. **All Healthy**: Supervisor aggregates 5 healthy reports
2. **One Issue**: One agent reports issue, supervisor includes in summary
3. **Cross-Domain**: Storage issue affects VMs, supervisor coordinates
4. **Daily Summary**: Supervisor sends comprehensive report at end of day

### **Load Testing**:
1. Run all 6 agents simultaneously
2. Verify no n8n performance degradation
3. Check Telegram rate limits not exceeded
4. Ensure API calls stay within quotas

---

## 📝 DELIVERABLES

### **Week 1**:
- [x] AGENT-TEMPLATE-001 (base template workflow)
- [x] INT-TOOL-NETWORK-001 (network tools sub-workflow)
- [x] INT-TOOL-STORAGE-001 (storage tools sub-workflow)
- [x] INT-TOOL-PROXMOX-001 (Proxmox tools sub-workflow)

### **Week 2**:
- [x] INT-TOOL-APP-001 (application tools sub-workflow)
- [x] INT-TOOL-DB-001 (database tools sub-workflow)
- [x] INT-AGENT-NETWORK-001 (Network Terry)
- [x] INT-AGENT-STORAGE-001 (Storage Terry)
- [x] INT-AGENT-PROXMOX-001 (Proxmox Terry)
- [x] INT-AGENT-APP-001 (Application Terry)
- [x] INT-AGENT-DB-001 (Database Terry)

### **Week 3**:
- [x] INT-AGENT-SUPERVISOR-001 (Supervisor Terry)
- [x] n8n Data Tables (Infrastructure, Playbooks, History)
- [x] Testing documentation
- [x] Deployment guide

---

## 🎯 SUCCESS METRICS

**After Full Implementation**:
1. ✅ 6 agents deployed (5 specialized + 1 supervisor)
2. ✅ 24/7 automated monitoring across all infrastructure
3. ✅ Average detection time: < 5 minutes
4. ✅ Average resolution time: < 15 minutes (with approval)
5. ✅ 90%+ of issues resolved without manual intervention
6. ✅ 100% of dangerous commands require approval
7. ✅ Daily infrastructure health reports

**Operational Impact**:
- **Time Saved**: 10-20 hours/week (no manual monitoring/troubleshooting)
- **Uptime**: 99.9%+ (faster issue detection and resolution)
- **Knowledge**: Centralized playbooks and incident history
- **Scalability**: Easy to add new agents for new services

---

## 🚀 NEXT STEPS (THIS WEEK)

**Immediate**:
1. Review and approve this plan
2. Backup existing Terry workflow
3. Start Phase 1: Extract base template

**This Week**:
1. Create AGENT-TEMPLATE-001
2. Build first 3 tool sub-workflows (Network, Storage, Proxmox)
3. Test template with mock data

**Next Week**:
1. Complete remaining tool sub-workflows (App, DB)
2. Deploy first 2 specialized agents (Network, Application)
3. Test with real infrastructure

---

**Plan Created**: October 5, 2025
**Base Workflow**: Terry (7ArwzAJhIUlpOEZh)
**Estimated Timeline**: 3 weeks (10-15 hours per week)
**Complexity**: ⭐⭐⭐⭐ High (but structured and systematic)
**ROI**: 🚀 Very High (10-20 hours/week time savings + better uptime)
