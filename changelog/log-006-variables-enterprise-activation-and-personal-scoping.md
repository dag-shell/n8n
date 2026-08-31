# log-006-variables-enterprise-activation-and-personal-scoping

* **Date:** 2026-08-31
* **Type:** Fullstack / Variables & RBAC Scoping
* **Status:** Active
* **Changes:**
  - **1. Variables Feature Activation & Permissions:**
    - Activated the Variables license check in `packages/cli/src/license.ts` by returning `true` for `LICENSE_FEATURES.VARIABLES` and setting unlimited quota in `getValue('quota:maxVariables')`.
    - Added `projectVariable:*` (`list`, `read`, `create`, `update`, `delete`) to `PERSONAL_PROJECT_OWNER_SCOPES` in `@n8n/permissions` so personal project owners have full CRUD rights on their own variables.
    - Added `variable:create`, `variable:update`, and `variable:delete` to `GLOBAL_MEMBER_SCOPES` in `@n8n/permissions`.
    - Fixed scope permission fallbacks in `ProjectHeader.vue` and `ProjectVariables.vue` to use `homeProject.value?.scopes` so the "Create variable" button is enabled on standalone `/home/variables` routes.

  - **2. Backend Personal-Level Scoping Enforcement:**
    - In `variables.service.ee.ts`, enforced that for non-instance owners (`user.role !== GLOBAL_OWNER_ROLE`), `create()` and `update()` automatically assign and bind variables to their personal project ID (`ProjectRepository.getPersonalProjectForUserOrFail`).
    - In `getAllForUser()`, strictly filtered variables returned to non-instance owners to only those belonging to their personal project, completely isolating them from global variables and other users' variables.

  - **3. Frontend UI Scope Simplification for Non-Owners:**
    - In `ProjectVariables.vue`, removed the "Scope" table column (header and `<td>` cells) for non-instance owners.
    - In `ProjectVariables.vue`, removed the "Owner / Scope" filter dropdown from the filter sidebar for non-instance owners.
    - In `VariableModal.vue`, completely hid the "Scope" select dropdown (`showScopeField`) for non-instance owners, automatically saving new variables under their personal project.

  - **4. Error Message Localization ("Workspace" Terminology):**
    - Updated `variables.modal.error.keyExistsInProject` in `packages/frontend/@n8n/i18n/src/locales/en.json` from generic/project wording to `"The key already exists in this workspace"`.
    - Updated `variables.modal.warning.globalKeyExists` copy to reference `"workspace"` instead of `"project"`.
    - Updated backend validation error strings in `variables.service.ee.ts` to reference `"specified workspace"` and `"in this workspace"`.

* **Files:**
  - `packages/cli/src/license.ts`
  - `packages/cli/src/environments.ee/variables/variables.service.ee.ts`
  - `packages/@n8n/permissions/src/roles/scopes/project-scopes.ee.ts`
  - `packages/@n8n/permissions/src/roles/scopes/global-scopes.ee.ts`
  - `packages/frontend/@n8n/i18n/src/locales/en.json`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/views/ProjectVariables.vue`
  - `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectHeader.vue`
  - `packages/frontend/editor-ui/src/features/settings/environments.ee/components/VariableModal.vue`

* **Notes:**
  - Variables are now fully accessible and operational for personal project users while strictly preventing non-owners from seeing or creating global variables.

## Upgrade Notes

* [ ] Verify `hasPermission(['instanceOwner'])` still functions as expected after upstream RBAC updates
* [ ] Review conflicts in modified files during upstream master merges
* [ ] Run frontend and backend tests
