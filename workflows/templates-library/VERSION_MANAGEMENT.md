# 🔄 VERSION MANAGEMENT & UPDATE PROCEDURES

**Last Updated**: December 2025
**Purpose**: Track n8n versions, node updates, and migration procedures

---

## 📊 CURRENT VERSIONS

### n8n Version
- **Current**: n8n v2.0.1 (Community Edition)
- **Location**: RackNerd VPS (172.245.56.50:5678)
- **Last Updated**: December 2025

### Node Versions
Tracked in: `05-version-updates/node-version-tracker.json`

**Key Nodes**:
- AI Agent Node: v1.0.0+
- OpenAI Node: v1.0.0+
- HTTP Request Node: v4.1+
- Airtable Node: v2.0+
- Google Sheets Node: v4.2+

---

## 🎯 UPDATE PHILOSOPHY

### "Don't Work Before You're Up to Date"

**Principle**: Before starting new client projects, ensure:
1. ✅ n8n is on latest stable version
2. ✅ All node versions are current
3. ✅ Templates use latest node features
4. ✅ Documentation reflects current capabilities

### Update Schedule

- **Weekly**: Check for n8n updates
- **Monthly**: Review node version changes
- **Quarterly**: Full template audit and update
- **Before Major Projects**: Mandatory version check

---

## 📋 UPDATE PROCEDURES

### Phase 1: Review New Version Features

**Steps**:
1. Check n8n release notes: https://github.com/n8n-io/n8n/releases
2. Review changelog for breaking changes
3. Identify new features relevant to templates
4. Document in `05-version-updates/n8n-v2.0.1-migration.md`

**Questions to Answer**:
- What new nodes are available?
- What node features were added?
- Are there breaking changes?
- What performance improvements exist?

### Phase 2: Test Templates in Draft Mode

**Steps**:
1. **Backup** all current templates
2. **Import** templates into test n8n instance (or use Draft mode)
3. **Update** node versions where applicable
4. **Test** each template individually
5. **Document** any issues found

**Testing Checklist**:
- [ ] All nodes load correctly
- [ ] Credentials still work
- [ ] Workflows execute successfully
- [ ] Error handling works
- [ ] Cost tracking works
- [ ] Human approval works

### Phase 3: Update Node Versions

**When to Update**:
- New node version available
- Bug fixes in current version
- Performance improvements
- New features needed

**How to Update**:
1. Open workflow in n8n
2. Click on node
3. Check "Node Version" dropdown
4. Select latest version
5. Test node functionality
6. Save (Draft) first
7. Publish when confirmed working

**Node Version Priority**:
1. **Critical**: Error handling, cost tracking, human approval
2. **High**: AI nodes, API integrations
3. **Medium**: Data transformation nodes
4. **Low**: Display/formatting nodes

### Phase 4: Publish Updated Templates

**Steps**:
1. **Test** all templates in Draft mode
2. **Verify** no breaking changes
3. **Update** documentation
4. **Publish** updated templates
5. **Notify** team of changes

**Publishing Order**:
1. Utility workflows first (`util_*`)
2. Function workflows (`func_*`)
3. Agent workflows (`agent_*`) last

**Why This Order?**
- Utilities are dependencies for others
- Functions are dependencies for agents
- Agents depend on everything

### Phase 5: Update Documentation

**Files to Update**:
- `CATALOG.md` - Template inventory
- `IMPLEMENTATION_GUIDE.md` - Usage instructions
- `README.md` - Overview
- `05-version-updates/node-version-tracker.json` - Version tracking
- This file (`VERSION_MANAGEMENT.md`)

**What to Document**:
- Version changes
- Breaking changes
- New features
- Migration steps
- Known issues

---

## 🔍 VERSION TRACKING

### Node Version Tracker

Location: `05-version-updates/node-version-tracker.json`

**Format**:
```json
{
  "lastUpdated": "2025-12-06",
  "n8nVersion": "2.0.1",
  "nodes": {
    "n8n-nodes-base.openai": {
      "current": "1.0.0",
      "latest": "1.0.0",
      "lastChecked": "2025-12-06",
      "notes": "Stable"
    },
    "n8n-nodes-base.airtable": {
      "current": "2.0.0",
      "latest": "2.0.0",
      "lastChecked": "2025-12-06",
      "notes": "Stable"
    }
  }
}
```

### Update Frequency

- **Weekly**: Check for updates
- **Monthly**: Update tracker file
- **Quarterly**: Full audit

---

## 🚨 BREAKING CHANGES

### How to Handle Breaking Changes

**When n8n or nodes have breaking changes**:

1. **Document** the breaking change
2. **Create** migration guide
3. **Update** affected templates
4. **Test** thoroughly
5. **Communicate** to team

**Example**: If OpenAI node changes input format:
1. Document old vs. new format
2. Create migration script
3. Update all templates using OpenAI
4. Test each updated template
5. Publish updated versions

---

## 📝 MIGRATION GUIDES

### n8n v2.0.1 Migration

Location: `05-version-updates/n8n-v2.0.1-migration.md`

**Key Features**:
- Publish vs. Save paradigm
- Improved Data Return from sub-workflows
- Enhanced AI Agent node
- Better error handling

**Migration Steps**:
1. Review new features
2. Update workflows to use Publish
3. Test sub-workflow data returns
4. Update AI Agent configurations
5. Test error handling

---

## 🔧 MAINTENANCE TASKS

### Weekly

- [ ] Check n8n GitHub for new releases
- [ ] Review node version updates
- [ ] Test critical workflows
- [ ] Check error logs

### Monthly

- [ ] Update node version tracker
- [ ] Review template performance
- [ ] Update pricing in cost calculator
- [ ] Archive old test workflows

### Quarterly

- [ ] Full template audit
- [ ] Update all node versions
- [ ] Review and update documentation
- [ ] Performance optimization
- [ ] Cost optimization review

### Before Major Projects

- [ ] **Mandatory**: Version check
- [ ] **Mandatory**: Template update
- [ ] **Mandatory**: Documentation review
- [ ] **Mandatory**: Test all utilities

---

## 📊 VERSION HISTORY

| Date | n8n Version | Major Changes | Templates Updated |
|------|-------------|---------------|-------------------|
| Dec 2025 | 2.0.1 | Publish feature, improved sub-workflows | All utilities |
| Nov 2025 | 1.122.5 | Previous stable | Initial templates |

---

## 🎯 BEST PRACTICES

### 1. Always Test in Draft First

Never publish untested changes. Always:
1. Make changes in Draft mode
2. Test thoroughly
3. Publish when confirmed working

### 2. Version Control

- Use Git for template JSON files
- Tag releases
- Document changes in commits

### 3. Communication

- Notify team of version updates
- Document breaking changes
- Share migration guides

### 4. Backup Before Updates

- Export all workflows before major updates
- Keep backups for 30 days
- Test restore process

---

## 🔗 RESOURCES

- **n8n Releases**: https://github.com/n8n-io/n8n/releases
- **n8n Documentation**: https://docs.n8n.io
- **Node Documentation**: https://docs.n8n.io/integrations/
- **Community Forum**: https://community.n8n.io

---

## ❓ FAQ

**Q: How often should I update?**
A: Check weekly, update monthly (if needed), full audit quarterly.

**Q: What if a node version breaks my workflow?**
A: Revert to previous version, document issue, report to n8n team.

**Q: Should I update all nodes at once?**
A: No. Update critical nodes first, test, then others.

**Q: How do I know if a new version has breaking changes?**
A: Check release notes and changelog. Test in Draft mode first.

---

**Next**: See `05-version-updates/` for specific migration guides.
