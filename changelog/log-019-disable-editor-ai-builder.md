# Log 019: Disable Canvas AI Workflow Builder and Assistant

## Context
The canvas AI Workflow Builder and Ask AI Assistant on the workflow editor page require an n8n Cloud subscription and active credits by default. On self-hosted instances without n8n Cloud, opening or interacting with the workflow builder triggers credit warnings and upgrade modals ("Modify your workflow: Ask n8n AI to modify existing nodes..."). To clean up the editor interface and prevent Cloud-only credit prompts, the canvas AI builder and assistant have been disabled.

## Changes Made

1. **Sidebar Navigation Update**:
   - In `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`, changed the Chat item's label to `'Agent'` and its icon to `'robot'`.

2. **Reverted License Whitelist for AI Builder Features**:
   - In `packages/cli/src/license.ts`, removed `LICENSE_FEATURES.AI_BUILDER` (`feat:aiBuilder`), `LICENSE_FEATURES.AI_ASSISTANT` (`feat:aiAssistant`), and `LICENSE_FEATURES.ASK_AI` (`feat:askAi`) from the always-licensed feature bypass list.

3. **Disabled Default Frontend Settings**:
   - In `packages/cli/src/services/frontend.service.ts`:
     - Set `aiBuilder: { enabled: false, setup: false }`.
     - Set `askAi: { enabled: false }`.
     - Left `aiAssistant: { enabled: false, setup: false }`.

4. **Resulting UI Behavior**:
   - The canvas "Build with AI" prompt button (`CanvasNodeChoicePrompt.vue`) is hidden.
   - The canvas floating assistant button (`AskAssistantFloatingButton.vue`) is hidden.
   - Node NDV / parameter AI assistant prompts and context menu options ("Add to AI") are suppressed.
   - The slide-out assistant panel (`AssistantsHub.vue` / `AskAssistantBuild.vue`) is prevented from opening.
   - Standard canvas actions (e.g. "Add first step" and workflow templates) remain fully accessible.

5. **Full Rebuild**:
   - Ran `pnpm build > build.log 2>&1`. All 70 packages built cleanly with zero errors (`70 successful, 70 total`).

## Files Modified
- `packages/frontend/editor-ui/src/features/collaboration/projects/components/ProjectNavigation.vue`
- `packages/cli/src/license.ts`
- `packages/cli/src/services/frontend.service.ts`
- `changelog/log-019-disable-editor-ai-builder.md`
