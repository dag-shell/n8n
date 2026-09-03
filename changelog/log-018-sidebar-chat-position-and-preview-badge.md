# Log 018: Move Chat Sidebar Item Below Workflows & Remove Preview Badge

## Context
In the main sidebar navigation, the Chat Hub link was previously positioned at the bottom of the navigation list and carried a "Preview" badge. To give chat and AI conversations a primary placement in the daily workflow alongside canvas automations, the Chat item has been repositioned directly below Workflows and the preview badge has been removed.

## Changes Made

1. **Removed Preview Badge**:
   - In `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`, removed `preview: true` and `position: 'bottom'` from the `chat` computed menu item.

2. **Repositioned Below Workflows**:
   - For non-owner members, moved the Chat menu item into the "Automation" group directly underneath the **Workflows** item (`workflowsItem`).
   - For instance owners, placed the Chat menu item directly below their personal workspace/workflows item (`personalProject`).
   - Removed the duplicate standalone Chat menu item from the bottom of the navigation list.
   - Added active state detection (`isChatActive`) covering `/chat`, personal agents, and workflow agents.

## Files Modified
- `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`
