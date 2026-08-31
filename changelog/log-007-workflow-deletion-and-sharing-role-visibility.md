# log-007-workflow-deletion-and-sharing-role-visibility

* **Date:** 2026-08-31
* **Type:** Frontend / UX & Permissions
* **Status:** Active
* **Changes:**
  - **1. Direct Workflow Deletion for Non-Instance Owners:**
    - Updated `WorkflowCard.vue` context menu to provide a direct `Delete` action on active/unarchived workflows for non-instance owners (`!hasPermission(['instanceOwner'])`), while preserving the `Archive` option.
    - Updated `ActionsDropdownMenu.vue` in the workflow canvas header to include direct `Delete` on unarchived workflows for non-instance owners.
  - **2. Hide Workflow Sharing for Non-Instance Owners:**
    - Gated `Share` action in `WorkflowCard.vue` context menu with `hasPermission(['instanceOwner'])`.
    - Gated `Share` action in `ActionsDropdownMenu.vue` with `hasPermission(['instanceOwner'])`.
    - Guarded `WorkflowShareModal.ee.vue` so non-instance owners cannot open or use the sharing modal.
  - **3. Show Archived Switch in Workflows Toolbar & Brand Styling:**
    - Added a dedicated `N8nSwitch2` toggle switch for **"Show archived"** on the opposite (left) side of the toolbar (directly across from Search, Sort, and Filters) in `WorkflowsView.vue`.
    - Updated switch active background tokens to use n8n's primary brand color (`var(--color--primary)`) instead of green.
    - Removed the redundant duplicate "Show archived" checkbox from the `#filters` drawer in `WorkflowsView.vue`.

* **Files:**
  - `packages/frontend/editor-ui/src/app/components/WorkflowCard.vue`
  - `packages/frontend/editor-ui/src/app/components/MainHeader/ActionsDropdownMenu.vue`
  - `packages/frontend/editor-ui/src/features/workflows/components/WorkflowShareModal.ee.vue`
  - `packages/frontend/editor-ui/src/app/views/WorkflowsView.vue`
  - `packages/frontend/@n8n/design-system/src/css/_tokens.scss`

* **Notes:**
  - Allows non-instance owners to delete workflows directly without forcing a two-step archive-first process, retains archive capabilities, eliminates workflow sharing for non-owners, and provides a brand-styled single toggle switch for archived workflows on the main toolbar.

## Upgrade Notes

* [ ] Verify `hasPermission(['instanceOwner'])` still functions as expected after upstream RBAC updates
* [ ] Review conflicts in modified files during upstream master merges
