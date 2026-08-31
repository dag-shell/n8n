# log-002-single-project-view-simplification

* **Date:** 2026-08-31
* **Type:** Frontend / UX & Navigation
* **Status:** Active
* **Changes:**
  - **1. Hide Project Badges from Resource Cards for Non-Owners:**
    - Gated the project badge (e.g. "Personal" badge) in `ProjectCardBadge.vue` with `hasPermission(['instanceOwner'])`.
    - Eliminates redundant project badges and links on workflow cards, credential cards, folder cards, and data table cards for non-owner users.
  
  - **2. Block `/projects/:projectId/...` Routes for Non-Owners:**
    - Added `instanceOwner` router middleware to `/projects` and `:projectId` child routes in `projects.routes.ts`.
    - Non-owner users cannot access `/projects/:projectId/*` routes and stay on unified `/home/*` views (`/home/workflows`, `/home/credentials`, `/home/executions`, etc.).
  
  - **3. Simplify Sidebar Project Navigation:**
    - Hidden redundant `Personal` project item from `ProjectNavigation.vue` for non-owners, leaving only `Overview` (`/home/workflows`).
  
  - **4. Update Context Redirection:**
    - In `WorkflowDetails.vue`, ensured post-deletion and post-archiving navigation routes to `VIEWS.WORKFLOWS` (`/home/workflows`) for non-owners instead of `VIEWS.PROJECTS_WORKFLOWS`.

* **Files:**
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectCardBadge.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/projects.routes.ts`
  - `packages/frontend/editor-ui/src/app/components/MainHeader/WorkflowDetails.vue`

* **Notes:**
  - Standardizes the experience for non-owners to a single, unified Overview view without unnecessary project-level segregation.

## Upgrade Notes

* [ ] Verify `hasPermission(['instanceOwner'])` still works after any upstream RBAC changes
* [ ] Review conflicts in `projects.routes.ts`, `ProjectCardBadge.vue`, `ProjectNavigation.vue`, and `WorkflowDetails.vue`
* [ ] Run tests
