
# Workflow Cleanup Instructions

## Before Cleanup
1. Verify all workflows have been successfully moved to `workflows-organized/`
2. Confirm all workflows are documented in Airtable
3. Ensure migration instructions are complete

## Cleanup Steps
1. **Backup original folder**: `cp -r workflows workflows-backup-$(date +%Y%m%d)`
2. **Remove original workflows folder**: `rm -rf workflows`
3. **Verify organized folder**: Check `workflows-organized/` contains all workflows
4. **Update documentation**: Ensure Airtable records reflect new locations

## Post-Cleanup Verification
- [ ] All workflows accessible in organized folders
- [ ] Migration instructions documented
- [ ] Airtable records updated
- [ ] README.md created and complete
- [ ] Backup folder created and verified

## Rollback Plan
If issues arise, restore from backup:
`cp -r workflows-backup-YYYYMMDD workflows`
