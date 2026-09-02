# log-013-restrict-insights-summary-to-overview

* **Date:** 2026-09-01
* **Type:** Frontend / UX Enhancement
* **Status:** Active
* **Changes:**
  - **1. Restrict InsightsSummary Execution Metrics Exclusively to Overview Page:**
    - Removed redundant `<InsightsSummary>` execution metrics card (`Prod. executions`, `Failed prod. executions`, `Failure rate`, `Time saved`, `Run time`) from secondary resource subviews:
      - `packages/frontend/editor-ui/src/app/views/WorkflowsView.vue`
      - `packages/frontend/editor-ui/src/features/execution/executions/views/ExecutionsView.vue`
      - `packages/frontend/editor-ui/src/features/credentials/views/CredentialsView.vue`
      - `packages/frontend/editor-ui/src/features/core/dataTable/DataTableView.vue`
      - `packages/frontend/editor-ui/src/features/collaboration/projects/views/ProjectVariables.vue`
      - `packages/frontend/editor-ui/src/features/agents/views/AgentsListView.vue`
    - Removed unused `insightsStore` references and imports from these views.
  - **2. Dedicated Display on Overview Dashboard:**
    - Preserved the full `<InsightsSummary>` banner exclusively on `HomeOverviewView.vue` (`/home/overview`), keeping subviews focused and clutter-free.
  - **3. Relocated Insights to Analytics below Overview in Sidebar:**
    - Removed the Insights menu item from the bottom sidebar menu (`MainSidebar.vue`).
    - Added **Analytics** (`id: 'analytics'`, icon `'chart-column-decreasing'`, routing to `VIEWS.INSIGHTS`) directly underneath **Overview** in `ProjectNavigation.vue` for both owners and non-owners.
    - Updated active navigation highlighting so `/insights` activates the Analytics sidebar item (`isAnalyticsActive` and `projectNavActiveId`).
    - Renamed user-facing strings from "Insights" to "Analytics" (`mainSidebar.analytics`, `insights.heading`, `insights.dashboard.title`).
  - **4. Standardized Overview Page Padding & Width:**
    - Removed `full-width` from `<PageViewLayout>` in `HomeOverviewView.vue`.
  - **5. Scoped Analytics Exclusively to Logged-in User's Personal Project & Header Layout:**
    - Removed `ProjectSharing` project picker dropdown from `InsightsDashboard.vue` so users can no longer toggle between all projects or other projects.
    - Bound all Analytics queries (summary, charts, and table) to the logged-in user's personal project ID (`personalProject?.id`).
    - Aligned the date range picker (`InsightsDataRangePicker`) side-by-side with the page title (`Analytics`) in a responsive flex header row (`.headerRow`).
    - Enforced backend personal project resolution in `InsightsController` (`packages/cli/src/modules/insights/insights.controller.ts`) for non-instance owners across all endpoints.

* **Files:**
  - `packages/frontend/editor-ui/src/app/views/WorkflowsView.vue`
  - `packages/frontend/editor-ui/src/features/execution/executions/views/ExecutionsView.vue`
  - `packages/frontend/editor-ui/src/features/credentials/views/CredentialsView.vue`
  - `packages/frontend/editor-ui/src/features/core/dataTable/DataTableView.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/views/ProjectVariables.vue`
  - `packages/frontend/editor-ui/src/features/agents/views/AgentsListView.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/views/HomeOverviewView.vue`
  - `packages/frontend/editor-ui/src/app/components/MainSidebar.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/projects.store.ts`
  - `packages/frontend/@n8n/i18n/src/locales/en.json`
  - `changelog/log-013-restrict-insights-summary-to-overview.md`
