# log-001-sidebar-role-based-visibility

* **Date:** 2026-08-31
* **Type:** Frontend / UX & Backend RBAC Security
* **Status:** Active
* **Changes:**
  - **1. Frontend Navigation & Sidebar UI:**
    - Gated **Templates**, **Resource Center**, **Help**, and **Settings** sidebar menu items with `hasPermission(['instanceOwner'])`.
    - Hidden **Search** (command bar button) and **Universal Add (+)** button from `MainSidebarHeader` for non-owners via `:hide-create="!hasPermission(['instanceOwner'])"`.
    - Unmounted `AppCommandBar` completely for non-owners (`v-if="showCommandBar"` with `hasPermission(['instanceOwner'])`), disabling `Ctrl+K / Cmd+K` shortcut and eliminating background command-bar API queries.
    - Suppressed background `fetchWallet()` call in `MainSidebar.vue` (`onMounted`) for non-owners.
  
  - **2. Frontend Route Protection (Router Middleware):**
    - Created `instanceOwner` router middleware (`packages/frontend/editor-ui/src/app/utils/rbac/middleware/instanceOwner.ts`) that validates `isInstanceOwner()` and redirects unauthorized users to `VIEWS.HOMEPAGE`.
    - Registered `instanceOwner` in `types/router.ts` and `utils/rbac/middleware.ts`.
    - Applied `middleware: ['authenticated', 'instanceOwner']` to routes:
      - `/templates`
      - `/templates/:id`
      - `/templates/:id/setup`
      - `/workflows/templates/:id`
      - `/workflows/onboarding/:id`
      - `/resource-center`
      - `/settings` (and all nested children)
    - Enhanced `router.beforeEach` to aggregate middleware across all matched route records (`to.matched.flatMap(...)`), ensuring nested child routes inherit parent route middleware guards.

  - **3. Backend RBAC & Scope Permissions:**
    - Cleaned `GLOBAL_MEMBER_SCOPES` in `packages/@n8n/permissions/src/roles/scopes/global-scopes.ee.ts` by removing privileged management scopes:
      - `user:list` (blocks non-owners from listing instance users via `GET /rest/users`)
      - `apiKey:list`, `apiKey:create`, `apiKey:delete`, `apiKey:update` (blocks non-owners from creating and managing API keys)
      - `credentialResolver:list` (blocks non-owners from enumerating credential resolvers)
      - `instanceAi:gateway` (blocks non-owners from AI Gateway endpoints)
    - Recompiled `@n8n/permissions` package (`pnpm --filter @n8n/permissions build`) so `AuthRolesService.init()` syncs the updated scope matrix to the database on boot.

  - **4. Backend Controller Endpoint Guards:**
    - **`AiController` (`packages/cli/src/controllers/ai.controller.ts`):**
      - Added `@GlobalScope('instanceAi:manage')` to `GET /rest/ai/gateway/config`.
      - Added `@GlobalScope('instanceAi:manage')` to `GET /rest/ai/gateway/wallet`.
      - Added `@GlobalScope('instanceAi:manage')` to `GET /rest/ai/gateway/usage`.
      - Added `@GlobalScope('instanceAi:manage')` to `GET /rest/ai/build/credits`.
    - **`ApiKeysController` (`packages/cli/src/controllers/api-keys.controller.ts`):**
      - Added `@GlobalScope('apiKey:list')` to `GET /rest/api-keys`.
      - Added `@GlobalScope('apiKey:delete')` to `DELETE /rest/api-keys/:id`.

* **Files:**
  - `packages/frontend/editor-ui/src/app/components/MainSidebar.vue`
  - `packages/frontend/editor-ui/src/app/components/MainSidebarHeader.vue`
  - `packages/frontend/editor-ui/src/app/components/app/AppCommandBar.vue`
  - `packages/frontend/editor-ui/src/app/router.ts`
  - `packages/frontend/editor-ui/src/app/types/router.ts`
  - `packages/frontend/editor-ui/src/app/utils/rbac/middleware.ts`
  - `packages/frontend/editor-ui/src/app/utils/rbac/middleware/instanceOwner.ts`
  - `packages/@n8n/permissions/src/roles/scopes/global-scopes.ee.ts`
  - `packages/cli/src/controllers/ai.controller.ts`
  - `packages/cli/src/controllers/api-keys.controller.ts`

* **Notes:**
  - Complete defense-in-depth: combines frontend UI hiding, Vue router redirection, and strict backend REST API authorization returning `403 Forbidden` for non-owners.

## Upgrade Notes

* [ ] Recompile permissions package with `pnpm --filter @n8n/permissions build` after any modifications to `@n8n/permissions`.
* [ ] Verify `hasPermission(['instanceOwner'])` still functions as expected following any upstream RBAC refactors.
* [ ] Review conflicts in modified files during upstream master merges.
* [ ] Run frontend and backend test suites (`pnpm test`).
