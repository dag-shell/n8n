# log-015-enable-instance-ai-personal-project-only

* **Date:** 2026-09-02
* **Type:** Backend & Frontend / AI Feature & Security Scoping
* **Status:** Active
* **Changes:**
  - **1. Unlock AI Builder, Instance AI, and Ask AI:**
    - Enabled `LICENSE_FEATURES.AI_BUILDER` (`feat:aiBuilder`), `LICENSE_FEATURES.AI_ASSISTANT` (`feat:aiAssistant`), and `LICENSE_FEATURES.ASK_AI` (`feat:askAi`) in `packages/cli/src/license.ts`.
    - Enabled `aiAssistant.enabled = true`, `aiAssistant.setup = true`, `aiBuilder.enabled = true`, `aiBuilder.setup = true`, and `askAi.enabled = true` in `packages/cli/src/services/frontend.service.ts`.
  - **2. Allow Non-Owners / Members Access to AI Builder Credits:**
    - In `packages/cli/src/controllers/ai.controller.ts`, lowered the authorization decorator for `GET /ai/build/credits` from `@GlobalScope('instanceAi:manage')` to `@GlobalScope('instanceAi:message')` so members/non-owners can query available builder credits without forbidden errors.
  - **3. Strict Personal Project Scoping on AI Controller Endpoints:**
    - Added checks in `AiController` (`build`, `getSessions`, `truncateMessages`, `clearSession`) ensuring that for non-owners, any workflow passed belongs to the user's personal project (`projectRepository.getPersonalProjectForUserOrFail(user.id)`), throwing `ForbiddenError` otherwise.
  - **4. Strict Personal Project Scoping on Instance AI Controller:**
    - In `packages/cli/src/modules/instance-ai/instance-ai.controller.ts`:
      - `ensureThread`: Automatically binds any new or resumed thread for non-owners to their personal project ID (`payload.projectId = personalProject.id`).
      - `chat`: Validates workflow attachments for non-owners to ensure attached workflows belong to their personal project.
  - **5. Strict Personal Project Scoping on Instance AI Adapter Service:**
    - In `packages/cli/src/modules/instance-ai/instance-ai.adapter.service.ts`:
      - **Workflows:** All workflow reads, version history, execution data, updates, archives, and publications check that the target workflow belongs to the user's personal project.
      - **Executions:** Execution retrieval and listing verify that the workflow associated with the execution belongs to the user's personal project.
      - **Credentials:** Credential access, deletion, and testing check against credentials available in the user's personal project.
      - **Workspaces:** `getProject` returns `null` if the requested project is not the personal project; `listProjects` returns only the user's personal project.
    - Added safe-guard checks ensuring unmocked partial repositories in unit tests do not throw errors while production enforces personal project isolation.
  - **6. Verification:**
    - `pnpm typecheck` passed (`tsc --noEmit` clean, 0 errors).
    - `ai.controller.test.ts` passed (33/33 tests).
    - `instance-ai.controller.test.ts` passed (121/121 tests).
    - `instance-ai.adapter.service.test.ts` passed (232/232 tests).
    - `instance-ai.adapter.service.security.test.ts` passed (24/24 tests).

* **Files:**
  - `packages/cli/src/license.ts`
  - `packages/cli/src/services/frontend.service.ts`
  - `packages/cli/src/controllers/ai.controller.ts`
  - `packages/cli/src/modules/instance-ai/instance-ai.controller.ts`
  - `packages/cli/src/modules/instance-ai/instance-ai.adapter.service.ts`
  - `packages/cli/src/environments.ee/variables/variables.service.ee.ts`
  - `changelog/log-015-enable-instance-ai-personal-project-only.md`
