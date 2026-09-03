# log-016-disable-onboarding-survey-popup

* **Date:** 2026-09-03
* **Type:** Backend & Frontend / UX
* **Status:** Active
* **Changes:**
  - **1. Disable Personalization Survey in Frontend Settings Response:**
    - In `packages/cli/src/services/frontend.service.ts`, set `personalizationSurveyEnabled: false` directly in the payload returned by the `/rest/settings` endpoint.
    - This ensures `settingsStore.isPersonalizationSurveyEnabled` on the frontend evaluates to `false`, preventing `usersStore.showPersonalizationSurvey()` from ever opening the modal across any routes (`WorkflowsView`, `NodeView`, `InstanceAiView`, `TemplatesSearchView`).
  - **2. Disable Personalization by Default in Global Config:**
    - Updated `packages/@n8n/config/src/configs/personalization.config.ts` to set default `enabled: boolean = false` for `PersonalizationConfig`.
  - **3. Failsafe Dismissibility on Personalization Modal:**
    - Updated `packages/frontend/editor-ui/src/features/settings/users/components/PersonalizationModal.vue` to set `:show-close="true"`, `:close-on-click-modal="true"`, and `:close-on-press-escape="true"` so that even if triggered manually, the dialog never locks the screen.

* **Files:**
  - `packages/@n8n/config/src/configs/personalization.config.ts`
  - `packages/cli/src/services/frontend.service.ts`
  - `packages/frontend/editor-ui/src/features/settings/users/components/PersonalizationModal.vue`
  - `changelog/log-016-disable-onboarding-survey-popup.md`

## Upgrade Notes

* [ ] Check this change after upstream update
* [ ] Run tests
* [ ] Review conflicts
