# log-005-remove-workflow-sidepanel-for-non-owners

* **Date:** 2026-08-31
* **Type:** Frontend / Workflow Canvas & Evaluation
* **Status:** Active
* **Changes:**
  - **1. Remove Evaluations Tab from Workflow Header:**
    - Gated the `Evaluations` tab in `MainHeader.vue` (`tabBarItems`) with `hasPermission(['instanceOwner'])`.
    - Non-owners only see `Editor` and `Executions` in the top workflow header.
    - Added `instanceOwner` middleware to `/workflow/:workflowId/evaluations` in `router.ts`.

  - **2. Clean Focus Panel & Canvas Toolbar for Non-Owners:**
    - In `NodeCreation.vue`, gated the vertical canvas toolbar "Search" button (`command-bar-button`) and "Open focus panel" button (`toggle-focus-panel-button`) with `hasPermission(['instanceOwner'])` so non-owners only see Add Node (+) and Sticky Note buttons.
    - Kept `<FocusSidebar>` available in `NodeView.vue` so focusing node parameters still works.
    - Gated `setupPanelStore.isFeatureEnabled` so non-owners do not get the `Setup` tab ("Workflow setup - Nothing to configure at the moment") and it does not auto-open on workflow load.
    - Gated `useEvaluationsWizardSidepanelExperiment` so non-owners do not get the `Evaluations` tab in the sidebar.
    - As a result, the sidebar cleanly renders the node Focus panel when active without extra tabs.

* **Files:**
  - `packages/frontend/editor-ui/src/app/components/MainHeader/MainHeader.vue`
  - `packages/frontend/editor-ui/src/app/router.ts`
  - `packages/frontend/editor-ui/src/app/views/NodeView.vue`
  - `packages/frontend/editor-ui/src/features/shared/nodeCreator/views/NodeCreation.vue`
  - `packages/frontend/editor-ui/src/features/setupPanel/setupPanel.store.ts`
  - `packages/frontend/editor-ui/src/experiments/evaluationsWizardSidepanel/useEvaluationsWizardSidepanelExperiment.ts`

* **Notes:**
  - Keeps the workflow canvas distraction-free for non-owners by removing the setup wizard, focus sidebar, and evaluation tabs.

## Upgrade Notes

* [ ] Verify `hasPermission(['instanceOwner'])` still functions as expected after upstream RBAC updates
* [ ] Review conflicts in modified files during upstream master merges
* [ ] Run frontend tests
