# log-003-sidebar-resource-navigation

* **Date:** 2026-08-31
* **Type:** Frontend / UX & Navigation
* **Status:** Active
* **Changes:**
  - **1. Direct Resource Navigation in Sidebar for Non-Owners (Grouped):**
    - Updated `ProjectNavigation.vue` to show organized groups of direct navigation items for non-owners:
      - **Group 1:** **Workflows** (`/home/workflows`, icon `git-branch`) & **Executions** (`/home/executions`, icon `history`)
      - **Group 2:** **Data tables** (`/home/datatables`, icon `table`)
      - **Group 3:** **Credentials** (`/home/credentials`, icon `key`) & **Variables** (`/home/variables`, icon `braces`)
    - Added divider lines between resource groups.
    - Added route matching to accurately highlight the active navigation item when viewing or editing child resources.
  
  - **2. Per-Page Specific Header Title, Subtitle, & Icon:**
    - Updated `ProjectHeader.vue` so that when non-owners navigate to a page, the header displays the specific page title, description, and icon (e.g. "Workflows", "Executions", "Data tables", "Credentials", "Variables") instead of generic "Overview" and its broad subtitle.
  
  - **3. Hide Redundant Horizontal Tab Bar in Overview Header:**
    - In `ProjectHeader.vue`, gated `<ProjectTabs />` with `hasPermission(['instanceOwner'])`.
    - Non-owners no longer see the duplicate horizontal tab bar across the top of resource lists, since navigation is directly in the sidebar.
  
  - **4. Data Tables Standalone & Modal Handling for Non-Owners:**
    - Registered standalone `/home/datatables/:id` route for `DataTableDetailsView`.
    - Updated `onAddModalClick` in `DataTableView.vue` and header actions in `ProjectHeader.vue` to open `ADD_DATA_TABLE_MODAL_KEY` directly for non-owners instead of redirecting to blocked `/projects/:projectId/datatables/new` route.
    - Updated `AddDataTableModal.vue` with proper `closeModal()` handling for the Cancel button / modal dismissal and automatic fallback to the user's personal project ID.
    - Updated `DataTableCard.vue` and `DataTableBreadcrumbs.vue` to navigate through `/home/datatables` routes for non-owners.
  
  - **5. Clean Multi-Project UI for Non-Owners:**
    - Hidden favorites and team project sections from the sidebar for non-owners.

* **Files:**
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectHeader.vue`
  - `packages/frontend/editor-ui/src/features/core/dataTable/DataTableView.vue`
  - `packages/frontend/editor-ui/src/features/core/dataTable/DataTableDetailsView.vue`
  - `packages/frontend/editor-ui/src/features/core/dataTable/components/AddDataTableModal.vue`
  - `packages/frontend/editor-ui/src/features/core/dataTable/components/DataTableCard.vue`
  - `packages/frontend/editor-ui/src/features/core/dataTable/components/DataTableBreadcrumbs.vue`
  - `packages/frontend/editor-ui/src/features/core/dataTable/module.descriptor.ts`

* **Notes:**
  - Provides a streamlined single-workspace sidebar layout for members and non-owners while preserving the multi-project workspace experience for instance owners.

## Upgrade Notes

* [ ] Verify `hasPermission(['instanceOwner'])` still functions as expected after upstream RBAC updates
* [ ] Review conflicts in modified files during upstream master merges
* [ ] Run frontend tests
