# log-022-host-system-metrics-dashboard

* **Date:** 2026-09-14
* **Type:** Fullstack / Dashboard & Monitoring
* **Status:** Active
* **Changes:** Replaced Execution Metrics on Overview dashboard with clean Host System Metrics cards (CPU, Memory, Storage, Network); moved Execution Metrics section to Analytics page and split Analytics into 3 distinct sections (Execution Metrics cards, Breakdown by day graph, Breakdown by workflow table); removed separate Host view and chart.

## What Changed

### Overview Dashboard (`HomeOverviewView.vue`)
- **Host System Metrics Cards:** Embedded real-time host metrics directly at the top of the Overview dashboard:
  - **CPU:** Usage percentage, core count, load average, and dynamic progress bar.
  - **Memory:** Usage percentage, used/total formatted memory, free memory, and progress bar with Lucide `memory-stick` icon.
  - **Storage:** Usage percentage, used/total disk space, free space, and progress bar.
  - **Network:** Real-time download and upload transfer rates, cumulative transferred totals (`Total: MB/GB`).
- Auto-polls every 5 seconds.
- Removed separate host header and redundant status badges for a clean card design.

### Analytics Dashboard (`InsightsDashboard.vue`)
- Split the previous single compacted block into **3 dedicated, distinct sections**:
  1. **Execution Metrics Card:** Standalone metrics card bar (`<InsightsSummary>`) with full rounded borders and dedicated heading.
  2. **Breakdown by Day Graph:** Independent card container (`.card`) enclosing the granularity heading, isolated loading overlay, and the trend chart.
  3. **Breakdown by Workflow Table:** Independent card container (`.card`) enclosing the workflow table (`<InsightsTableWorkflows>`) with isolated pagination loading overlay.
- Styled using standard n8n design system variables (`--color--background--light-3` and `--color--foreground`).

### Backend (`HostMetricsController`)
- Single clean REST endpoint `GET /rest/host-metrics` powered by `systeminformation`:
  - Modular helpers collecting CPU, memory, storage, network rates/totals, system details, and timestamps.
  - Removed redundant `/stats` endpoints and graph-generating overhead.

### Cleanup & Removals
- Deleted separate `HomeHostView.vue` page and its associated Chart.js line chart.
- Cleaned up `/home/host` routes, `VIEWS.HOME_HOST` enum, `ProjectNavigation` sidebar item, and `ProjectHeader` mappings.

* **Files:**
  - `packages/cli/src/controllers/host-metrics.controller.ts`
  - `packages/cli/src/server.ts`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/views/HomeOverviewView.vue`
  - `packages/frontend/editor-ui/src/features/execution/insights/components/InsightsDashboard.vue`
