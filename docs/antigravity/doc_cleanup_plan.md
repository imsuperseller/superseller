# Legacy Reference Cleanup Plan

## Goal Description
The objective is to remove all references to Airtable, Boost.space, and Typeform from high-level documentation and architectural diagrams to align with the primary technical stack (Firestore, n8n, MCP-native). These tools are now considered legacy or project-specific and should not be presented as core parts of the Rensto business infrastructure.

## Proposed Changes

### High-Level Documentation

#### [MODIFY] [CLAUDE.md](file:///Users/shaifriedman/New%20Rensto/rensto/CLAUDE.md)
- Remove Airtable, Notion, and Boost.space from the "Active MCP Servers" list in the header.
- Update the "Current Architecture" diagram to remove the "ARCHIVE: Boost.space & Airtable (Legacy)" block.
- Update "Active Systems" to remove these tools.

#### [MODIFY] [README.md](file:///Users/shaifriedman/New%20Rensto/rensto/README.md)
- Remove Airtable from the "Technical Architecture" core diagram.
- Ensure all mentions of these tools are either removed or clearly labeled as archived for historical data only.

#### [MODIFY] [INTEGRATIONS.md](file:///Users/shaifriedman/New%20Rensto/rensto/docs/technical/INTEGRATIONS.md)
- Remove legacy tools from the "Active MCP Servers" list.
- Add a new "Legacy/Archived" section at the bottom for historical context if necessary.

## Verification Plan

### Automated Tests
- None required for documentation.

### Manual Verification
- Review the updated documentation for consistency and ensure no "ghost" references remain in high-level overviews.
