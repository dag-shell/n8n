# log-014-unlock-enterprise-features

* **Date:** 2026-09-02
* **Type:** Backend & Frontend / Feature Unlock

* **Status:** Active
* **Changes:**
  - **1. Unlock "Debug in Editor":**
    - Enabled `LICENSE_FEATURES.DEBUG_IN_EDITOR` (`feat:debugInEditor`) in `packages/cli/src/license.ts` and set `debugInEditor: true` in `packages/cli/src/services/frontend.service.ts`.
    - Clicking "Debug in editor" on an execution row in the executions list now immediately opens the canvas with the execution node data and pin data loaded, bypassing `DebugPaywallModal.vue`.
  - **2. Unlock Advanced Execution Filters (Custom Data / Metadata & Tags):**
    - Enabled `LICENSE_FEATURES.ADVANCED_EXECUTION_FILTERS` (`feat:advancedExecutionFilters`) in `packages/cli/src/license.ts` and set `advancedExecutionFilters: true` in `packages/cli/src/services/frontend.service.ts`.
    - Unlocked custom data (metadata key, value, exact match) and annotation tags filtering in `ExecutionsFilter.vue`. Removed disabled state and "View plans" upgrade tooltip.
    - Preserved `query.metadata` and `query.annotationTags` parsing in `ExecutionsController`.
  - **3. Unlock External Secrets & Remove Credential Paywall:**
    - Enabled `LICENSE_FEATURES.EXTERNAL_SECRETS` (`feat:externalSecrets`) in `packages/cli/src/license.ts` and set `externalSecrets: true` in `packages/cli/src/services/frontend.service.ts`.
    - Suppressed the enterprise fallback info tip in `CredentialConfig.vue` (*"Enterprise plan users can pull in credentials from external vaults"*).
  - **4. Unlock Folders:**
    - Enabled `LICENSE_FEATURES.FOLDERS` (`feat:folders`) in `packages/cli/src/license.ts`, allowing full workflow organization and folder hierarchy without enterprise licensing restrictions.
  - **5. Remove 24-Hour Upgrade Delay Tooltip from Analytics:**
    - Cleaned up `insights.banner.noData.tooltip` in `packages/frontend/@n8n/i18n/src/locales/en.json` from *"Manual executions aren’t counted. Data may take up to 24 hours to update after upgrading. {link}"* to *"Manual executions aren’t counted. {link}"*.
  - **6. Clean Up Variables Upgrade Hint in Expression Editor / Schema View:**
    - Updated `dataMapping.schemaView.variablesUpgrade` in `packages/frontend/@n8n/i18n/src/locales/en.json` to remove the reference to "Pro or Enterprise plan", directing users to workspace variables.

* **Files:**
  - `packages/cli/src/license.ts`
  - `packages/cli/src/services/frontend.service.ts`
  - `packages/frontend/@n8n/i18n/src/locales/en.json`
  - `changelog/log-014-unlock-enterprise-features.md`
