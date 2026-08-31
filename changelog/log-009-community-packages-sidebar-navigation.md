# log-009-community-packages-sidebar-navigation

* **Date:** 2026-08-31
* **Type:** Frontend / UX Navigation & Full Member Management
* **Status:** Active
* **Changes:**
  - **1. Added Community Packages to Sidebar Resource Navigation:**
    - Updated `ProjectNavigation.vue` to include a new navigation group (Group 4) for **Community packages** (`id: 'community-packages'`, icon `'box'`, route `/home/community-packages`).
    - Added route active detection (`isCommunityPackagesActive`) so the sidebar item is correctly highlighted when viewing community packages.
  - **2. Registered Standalone Route `/home/community-packages`:**
    - Added `community-packages` child route under `/home` with `SettingsCommunityNodesView` component in `projects.routes.ts`.
    - Added redirects `/community-packages` and `/community-nodes` to `/home/community-packages`.
    - Registered `VIEWS.HOME_COMMUNITY_PACKAGES` in `@n8n/frontend-constants/views`.
  - **3. Enabled Full Community Package Permissions for Members:**
    - Added `communityPackage:list`, `communityPackage:install`, `communityPackage:update`, `communityPackage:uninstall`, and `communityPackage:manage` to `GLOBAL_MEMBER_SCOPES` in `packages/@n8n/permissions/src/roles/scopes/global-scopes.ee.ts`.
    - Recompiled `@n8n/permissions` package and rebuilt backend.
  - **4. Enabled Community Node Installation & Updates in Frontend UI for Members:**
    - Removed `isAdminOrOwner` blocking in `useInstallNode.ts` (`installNode`).
    - Removed `isAdminOrOwner` restriction in `useInstalledCommunityPackage.ts` (`isUpdateCheckAvailable`).
    - Removed `isAdminOrOwner` guard on `N8nButton` in `CommunityNodeDetails.vue` to allow installing nodes directly from node creator / search.
    - Removed `ContactAdministratorToInstall` placeholder banner in `CommunityNodeInfo.vue`.
  - **5. Unified Workspace Page Spacing & Header Layout:**
    - Wrapped `SettingsCommunityNodesView.vue` with `PageViewLayout` and `ProjectHeader` matching the standard layout, spacing (`--content-container--width`), padding, and header alignment of other resource views (Workflows, Executions, Credentials, Variables, Data tables).
    - Updated `ProjectHeader.vue` with `ACTION_TYPES.COMMUNITY_PACKAGE` to render the primary "Install a community node" button in the top-right header action group, along with the box icon, page title, and subtitle description.

* **Files:**
  - `packages/@n8n/permissions/src/roles/scopes/global-scopes.ee.ts`
  - `packages/frontend/@n8n/frontend-constants/src/views.ts`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/projects.routes.ts`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectHeader.vue`
  - `packages/frontend/editor-ui/src/features/settings/communityNodes/views/SettingsCommunityNodesView.vue`
  - `packages/frontend/editor-ui/src/features/settings/communityNodes/composables/useInstallNode.ts`
  - `packages/frontend/editor-ui/src/features/settings/communityNodes/composables/useInstalledCommunityPackage.ts`
  - `packages/frontend/editor-ui/src/features/settings/communityNodes/components/nodeCreator/CommunityNodeDetails.vue`
  - `packages/frontend/editor-ui/src/features/settings/communityNodes/components/nodeCreator/CommunityNodeInfo.vue`
  - `packages/frontend/editor-ui/src/features/settings/communityNodes/components/nodeCreator/CommunityNodeInstallHint.vue`

* **Notes:**
  - Gives all users direct 1-click access to installed and browseable community packages directly from the sidebar with standard workspace layout and spacing, and enables installing, updating, and managing community nodes without owner/admin restrictions.

## Upgrade Notes

* [ ] Recompile permissions package with `pnpm --filter @n8n/permissions build` after any modifications to `@n8n/permissions`.
* [ ] Verify route and sidebar navigation during upstream master merges.
* [ ] Review conflicts in modified files during upstream master merges.
