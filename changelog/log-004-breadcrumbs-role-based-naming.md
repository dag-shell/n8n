# log-004-breadcrumbs-role-based-naming

* **Date:** 2026-08-31
* **Type:** Frontend / Navigation & Breadcrumbs
* **Status:** Active
* **Changes:**
  - **1. Workflow Breadcrumbs for Non-Owners:**
    - Updated `ProjectBreadcrumb.vue` so that non-owners see clean text **`Workflows`** (without leading icons) linking to `/home/workflows` instead of `Personal` with user icon linking to `/projects/:projectId`.
    - Updated `FolderBreadcrumbs.vue` so that folder links resolve to `/home/folders/:folderId/workflows` for non-owners.
    - Updated `WorkflowCard.vue` so card breadcrumb folder links resolve to `/home/folders/:folderId/workflows` for non-owners.
  
  - **2. Data Table Breadcrumbs for Non-Owners:**
    - Updated `DataTableBreadcrumbs.vue` so that `<ProjectBreadcrumb>` is only prepended for instance owners.
    - Non-owners now see clean text **`Data tables / <data-table-name>`** (without leading icon and without leading `/` separator) linking directly to `/home/datatables`.

  - **3. Header Action Button Simplification for Non-Owners:**
    - In `ProjectHeader.vue`, removed the split-button chevron dropdown toggle (`ProjectCreateResource`) for non-owners.
    - Non-owners now have a direct, single primary action button (e.g. "Create workflow", "Create credential", "Create data table", "Create variable") without the cross-resource dropdown list.

* **Files:**
  - `packages/frontend/editor-ui/src/features/core/folders/components/ProjectBreadcrumb.vue`
  - `packages/frontend/editor-ui/src/features/core/folders/components/FolderBreadcrumbs.vue`
  - `packages/frontend/editor-ui/src/features/core/dataTable/components/DataTableBreadcrumbs.vue`
  - `packages/frontend/editor-ui/src/app/components/WorkflowCard.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectHeader.vue`

* **Notes:**
  - Replaces internal multi-project breadcrumb paths (`Personal / ...`) with direct functional resource breadcrumbs (`Workflows / ...`, `Data tables / ...`) for non-owners.

## Upgrade Notes

* [ ] Verify `hasPermission(['instanceOwner'])` still functions as expected after upstream RBAC updates
* [ ] Review conflicts in modified breadcrumb files during upstream master merges
* [ ] Run frontend tests
