# log-011-sidebar-grouping-and-header-cleanups

* **Date:** 2026-09-01
* **Type:** Frontend / UX Navigation & Header Refinement
* **Status:** Active
* **Changes:**
  - **1. Sidebar Functional Grouping & Subtitles:**
    - Regrouped sidebar direct resource navigation in `ProjectNavigation.vue` into 3 functional dashboard groups:
      - **Group 1 (Automation):** Workflows (`/home/workflows`), Data tables (`/home/datatables`), Executions (`/home/executions`)
      - **Group 2 (Configuration):** Credentials (`/home/credentials`), Variables (`/home/variables`)
      - **Group 3 (Integrations):** MCP Config (`/home/mcp`), Packages (`/home/community-packages`)
    - Added clean uppercase section subtitles (`.groupSubtitle`) to each group with subtle styling (`10px`, bold, letter-spaced) matching standard dashboard sidebar designs.
    - Subtitles automatically hide when the sidebar is collapsed while preserving hairline group dividers (`.groupDivider`) between icon clusters.
    - Added localized keys in `@n8n/i18n`: `mainSidebar.group.automation` ("Automation"), `mainSidebar.group.configuration` ("Configuration"), `mainSidebar.group.integrations` ("Integrations").
  - **2. Sidebar & Header Label Renaming:**
    - Renamed "Instance-level MCP" to **"MCP Config"** in `en.json` (`settings.mcp`, `settings.mcp.page.title`).
    - Renamed "Community nodes" to **"Packages"** in `en.json` (`settings.communityNodes`).
    - Seamlessly updates sidebar menu items, document titles, and page headers without hardcoding.
  - **3. Removed "Create workflow" Button on Executions Page Header:**
    - Added `isExecutionsPage` computed check in `ProjectHeader.vue` covering `VIEWS.EXECUTIONS`, `VIEWS.EXECUTION_HOME`, `VIEWS.EXECUTION_PREVIEW`, and `VIEWS.EXECUTION_DEBUG`.
    - Suppressed default resource creation action ("Create workflow") on executions page headers unless custom actions are explicitly provided in `#actions`.
  - **4. Fixed "Create workflow" Button Flash During Packages Page Loading:**
    - Updated `SettingsCommunityNodesView.vue` to always pass `main-button="communityPackage"` instead of conditionally passing `undefined` while `loading` is true or when 0 packages are installed.
    - Updated `ProjectHeader.vue` `selectedMainButtonType` with `isCommunityNodesPage` fallback to `ACTION_TYPES.COMMUNITY_PACKAGE` so it never falls back to `ACTION_TYPES.WORKFLOW`.
    - The button consistently displays **"Install"** from the very first frame of page render/reload instead of temporarily displaying "Create workflow".

* **Files:**
  - `packages/frontend/@n8n/i18n/src/locales/en.json`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectHeader.vue`
  - `packages/frontend/editor-ui/src/features/settings/communityNodes/views/SettingsCommunityNodesView.vue`
  - `changelog/log-011-sidebar-grouping-and-header-cleanups.md`

* **Notes:**
  - Standardizes the workspace sidebar navigation into clear functional categories with subtitles while eliminating unwanted "Create workflow" buttons from executions and packages headers.

## Upgrade Notes

* [ ] Rebuild `@n8n/i18n` with `pnpm --filter @n8n/i18n build` when updating localization keys.
* [ ] Review route names and header actions during upstream master merges.
* [ ] Check sidebar grouping styling against upstream theme variations.
