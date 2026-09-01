# log-010-mcp-sidebar-navigation-and-member-access

* **Date:** 2026-08-31
* **Type:** Frontend / UX Navigation & Full Member Management
* **Status:** Active
* **Changes:**
  - **1. Added MCP Server to Sidebar Resource Navigation (Group 3):**
    - Updated `ProjectNavigation.vue` to include **MCP** (`id: 'mcp'`, icon `'mcp'`, route `/home/mcp`) in Group 3 directly below **Variables** (alongside Credentials and Variables).
    - Group 4 now cleanly isolates **Community Packages**.
    - Added route active detection (`isMcpActive`) so the sidebar item remains highlighted across `/home/mcp`, `/home/mcp/workflows`, `/home/mcp/agents`, `/home/mcp/clients`, and related MCP views.
  - **2. Registered Standalone Routes & Redirects for `/home/mcp`:**
    - Registered child routes for `mcp`, `mcp/workflows`, `mcp/agents`, and `mcp/clients` under `/home` in `projects.routes.ts`.
    - Added redirect rules for `/mcp`, `/mcp/workflows`, `/mcp/agents`, and `/mcp/clients` to route directly into `/home/mcp/*`.
    - Registered `VIEWS.HOME_MCP`, `VIEWS.HOME_MCP_WORKFLOWS`, `VIEWS.HOME_MCP_AGENTS`, and `VIEWS.HOME_MCP_CLIENTS` in `@n8n/frontend-constants/views`.
    - Kept `commonChildRouteExtensions.projects` and `commonChildRouteExtensions.home` array indices aligned to prevent route resolution errors.
  - **3. Enabled Full MCP Permissions for Members in Backend RBAC:**
    - Added `mcp:manage` scope to `GLOBAL_MEMBER_SCOPES` in `packages/@n8n/permissions/src/roles/scopes/global-scopes.ee.ts`.
    - Recompiled `@n8n/permissions` package and rebuilt backend `n8n`.
  - **4. Standardized Page Spacing & Layout Across All MCP Views:**
    - Wrapped `SettingsMCPView.vue`, `SettingsMCPWorkflowsView.vue`, `SettingsMCPAgentsView.vue`, and `SettingsMCPClientsView.vue` in `PageViewLayout` + `ProjectHeader`.
    - Unified horizontal and vertical spacing to match other resource views (Workflows, Executions, Credentials, Variables, Community Nodes) with `--content-container--width` and standard padding.
    - Updated `ProjectHeader.vue` with dedicated title and description handling for sub-views:
      - `VIEWS.HOME_MCP`: "Instance-level MCP" / "Access your n8n instance through MCP clients."
      - `VIEWS.HOME_MCP_WORKFLOWS`: "Workflows exposed" / "Choose which workflows connected clients can reach over MCP."
      - `VIEWS.HOME_MCP_CLIENTS`: "Connected clients" / "Assistants and IDEs connected to this instance over MCP."
      - `VIEWS.HOME_MCP_AGENTS`: "Agents exposed" / "Choose which agents connected clients can reach over MCP."
  - **5. In-Workspace Sub-View Routing & Back Navigation:**
    - Updated `SettingsMCPView.vue` navigation handlers (`openWorkflowsView`, `openClientsView`, `openAgentsView`) to route directly to `VIEWS.HOME_MCP_WORKFLOWS`, `VIEWS.HOME_MCP_CLIENTS`, and `VIEWS.HOME_MCP_AGENTS`.
    - Eliminated previous redirects to `/home/workflows` triggered by `instanceOwner` middleware when non-owners clicked "Workflows exposed" or "Connected clients" (which formerly pushed `/settings/mcp/*`).
    - Updated `onBack` in `SettingsMCPWorkflowsView.vue`, `SettingsMCPClientsView.vue`, and `SettingsMCPAgentsView.vue` to push `VIEWS.HOME_MCP` so back navigation stays within workspace home.
    - Updated `module.descriptor.ts` `settingsPages` entry and `WorkflowsView.vue` `settingsLink` to resolve directly to `VIEWS.HOME_MCP`.
  - **6. Removed Unnecessary "Create workflow" Top Button on MCP Pages:**
    - Updated `ProjectHeader.vue` to detect `isMcpPage` and added support for `<slot name="actions">`.
    - Default resource creation button ("Create workflow") is now suppressed on MCP views (`/home/mcp`, `/home/mcp/workflows`, `/home/mcp/clients`, `/home/mcp/agents`) unless explicit view actions are provided via the `#actions` slot (such as "Connect workflows" / "Refresh" on the exposed workflows subview).
    - Removed redundant header action in `SettingsMCPView.vue`, keeping the main MCP header clean and clutter-free.
  - **7. Fixed MCP Enable/Disable Toggle & Confirmation Dialog:**
    - Fixed `N8nDialog` two-way open binding in `SettingsMCPView.vue` from broken `v-model="showDisableDialog"` to `:open="showDisableDialog"` and `@update:open="showDisableDialog = $event"`. Previously, selecting "Disable" in the status dropdown set `showDisableDialog = true`, but because `N8nDialog` only consumes `:open`, the confirmation modal never mounted/opened and clicking "Disable" appeared completely unresponsive.
    - Updated the modal's Cancel button to directly execute `@click="showDisableDialog = false"`, removing the unused `N8nDialogClose` wrapper.
    - Updated `canManageMcpInstance` and `canToggleMCP` in `SettingsMCPView.vue` so workspace members and instance owners are not blocked by the `"Only instance admins can change this"` disabled state unless the instance setting is explicitly managed via environment variable (`mcpManagedByEnv`).

* **Files:**
  - `packages/@n8n/permissions/src/roles/scopes/global-scopes.ee.ts`
  - `packages/frontend/@n8n/frontend-constants/src/views.ts`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/projects.routes.ts`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectHeader.vue`
  - `packages/frontend/editor-ui/src/features/ai/mcpAccess/SettingsMCPView.vue`
  - `packages/frontend/editor-ui/src/features/ai/mcpAccess/SettingsMCPWorkflowsView.vue`
  - `packages/frontend/editor-ui/src/features/ai/mcpAccess/SettingsMCPAgentsView.vue`
  - `packages/frontend/editor-ui/src/features/ai/mcpAccess/SettingsMCPClientsView.vue`
  - `packages/frontend/editor-ui/src/features/ai/mcpAccess/module.descriptor.ts`
  - `packages/frontend/editor-ui/src/app/views/WorkflowsView.vue`
  - `changelog/log-010-mcp-sidebar-navigation-and-member-access.md`

* **Notes:**
  - Gives all users direct 1-click access to MCP server configuration, connected clients, exposed workflows, and agents directly from the sidebar with standard workspace layout and spacing without permission roadblocks.

## Upgrade Notes

* [ ] Recompile permissions package with `pnpm --filter @n8n/permissions build` after any modifications to `@n8n/permissions`.
* [ ] Verify route and sidebar navigation during upstream master merges.
* [ ] Review conflicts in modified files during upstream master merges.
