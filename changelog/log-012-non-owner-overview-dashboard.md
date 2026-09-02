# log-012-non-owner-overview-dashboard

* **Date:** 2026-09-01
* **Type:** Frontend / UX Dashboard & Insights Access
* **Status:** Active
* **Changes:**
  - **1. Dedicated Overview Dashboard at `/home/overview`:**
    - Created `HomeOverviewView.vue` (`packages/frontend/editor-ui/src/features/collaboration/projects/views/HomeOverviewView.vue`) serving as the dedicated workspace landing page for non-instance owners.
    - Integrated execution metrics via `<InsightsSummary />` (7-day weekly stats: total executions, failed runs, failure rate, time saved, and average run time).
    - Designed 4 interactive KPI metric cards linking to resource pages:
      - **Workflows:** Total workflows, active vs inactive count, link to `/home/workflows`.
      - **Executions:** Total runs, failed executions count, success rate, link to `/home/executions`.
      - **Credentials:** Connected accounts count, link to `/home/credentials`.
      - **Data Tables & Integrations:** Data tables count, variables count, and MCP status, link to `/home/datatables`.
    - Added a 2-column activity & action dashboard:
      - **Recent Workflows:** Displays up to 5 recently updated workflows with active status badges, relative time, and 1-click navigation to the workflow canvas editor.
      - **Quick Actions:** Instant action shortcuts for creating a new workflow, adding a credential, creating a data table, browsing community packages, and managing MCP tools.
  - **2. Standalone Routes and Redirects:**
    - Registered `VIEWS.HOME_OVERVIEW` in `@n8n/frontend-constants`.
    - Registered child route `overview` with `HomeOverviewView` component under `/home` and `/projects/:projectId` in `projects.routes.ts`.
    - Configured `/overview` and `/home` to redirect directly to `/home/overview`.
    - Aligned `commonChildRouteExtensions.home` and `commonChildRouteExtensions.projects` arrays.
  - **3. Sidebar Navigation for Non-Owners:**
    - Updated `ProjectNavigation.vue` to render **Overview** (`id: 'home'`, icon `'house'`, route `/home/overview`) at the top of the sidebar for non-owners, separated from the functional groups by a divider line.
    - Added route active detection (`isOverviewActive`) so the Overview sidebar item stays highlighted across `/home/overview`, `/home`, and `/overview`.
    - Cleaned `isWorkflowsActive` so it only highlights when actually viewing workflows or folders.
  - **4. Backend RBAC & License Unlocking for Insights:**
    - Added `insights:list` and `insights:read` scopes to `GLOBAL_MEMBER_SCOPES` in `packages/@n8n/permissions/src/roles/scopes/global-scopes.ee.ts`.
    - Unlocked `INSIGHTS_VIEW_SUMMARY`, `INSIGHTS_VIEW_DASHBOARD`, `INSIGHTS_VIEW_HOURLY_DATA`, and set `INSIGHTS_MAX_HISTORY_DAYS` to unlimited in `packages/cli/src/license.ts`.
    - Recompiled `@n8n/permissions` and `@n8n/frontend-constants` packages.
  - **5. Header Customization & Action Button Suppression:**
    - Handled `VIEWS.HOME_OVERVIEW` in `ProjectHeader.vue` for `headerIcon` (`house`), `projectName` ("Overview"), and `sectionDescription` ("Monitor your workspace activity, execution metrics, and automations at a glance.").
    - Added `isOverviewPage` computed guard to `ProjectHeader.vue` and removed `:main-button="'workflow'"` from `HomeOverviewView.vue`, suppressing the default "Create workflow" action button on overview headers unless custom action slots are explicitly passed.
    - Preserved `ProjectHeader` horizontal tab suppression for non-owners.

* **Files:**
  - `packages/frontend/@n8n/frontend-constants/src/views.ts`
  - `packages/@n8n/permissions/src/roles/scopes/global-scopes.ee.ts`
  - `packages/cli/src/license.ts`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/views/HomeOverviewView.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/projects.routes.ts`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectHeader.vue`
  - `changelog/log-012-non-owner-overview-dashboard.md`

* **Notes:**
  - Provides a streamlined, modern workspace overview dashboard for members and non-owners without redundant horizontal tabs, keeping full direct access to metrics and quick actions.

## Upgrade Notes

* [ ] Recompile permissions package with `pnpm --filter @n8n/permissions build` after any modifications to `@n8n/permissions`.
* [ ] Rebuild `@n8n/frontend-constants` with `pnpm --filter @n8n/frontend-constants build` when modifying views.
* [ ] Review route names and sidebar active logic during upstream master merges.
