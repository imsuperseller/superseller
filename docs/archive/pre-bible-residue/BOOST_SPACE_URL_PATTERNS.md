# Boost.space URL Patterns and Field Group Assignment

## Record Detail View URL Pattern

Based on Boost.space documentation, the correct URL pattern for accessing a record detail view is:

```
https://your-boostspace-domain.com/module-name/space/space-id/record/record-id
```

### For Notes Module, Space 45, Record 257:

**Documented Pattern:**
```
https://superseller.boost.space/note/space/45/record/257
```

**⚠️ Note:** This pattern returns 404 in testing. The actual URL pattern may be different. Need to verify by:
1. Clicking on a record in the list view
2. Observing the actual URL that loads
3. Using that pattern for automation

**Previous incorrect attempts:**
- ❌ `https://superseller.boost.space/list/note/45/257` (shows list view, not detail)
- ❌ `https://superseller.boost.space/note/45/257` (incorrect pattern)
- ❌ `https://superseller.boost.space/note/space/45/record/257` (returns 404)
- ❌ `https://superseller.boost.space/list/note/45` (list view only)

## Custom Field Group Assignment

### Field Group: "n8n Workflow Fields" (ID: 475)

**Location:** System Settings → Custom Fields → Notes Module

**To assign to Space 45:**
1. Navigate to: `https://superseller.boost.space/settings/custom-field/`
2. Find "n8n Workflow Fields" in the table
3. Click on the "Spaces" column for that row
4. Select Space 45 (or "n8n Workflows (Notes)" space)
5. Save the assignment

**Important:** Custom fields only appear in record detail views when:
1. The field group is assigned to the specific space
2. You're viewing the record in detail view (not list view)
3. The record is in that assigned space

## Browser Automation Script Updates Needed

The script at `/scripts/boost-space/populate-via-browser-integrated-v2.cjs` should:

1. **Use correct URL pattern:**
   ```javascript
   const recordUrl = `${CONFIG.boostSpace.baseUrl}/note/space/${CONFIG.boostSpace.spaceId}/record/${CONFIG.boostSpace.recordId}`;
   ```

2. **Verify field group assignment** before attempting to fill fields

3. **Wait for detail view to load** (not list view)

## References

- Boost.space Documentation: [Space ID and Record ID](https://docs.boost.space/knowledge-base/integrations/mapping/space-id-and-record-id-in-boost-space/)
- Boost.space Documentation: [Field Groups](https://docs.boost.space/knowledge-base/system/features/field-groups/)
