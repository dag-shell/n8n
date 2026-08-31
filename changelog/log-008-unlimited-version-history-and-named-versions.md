# log-008-unlimited-version-history-and-named-versions

* **Date:** 2026-08-31
* **Type:** Backend & Frontend / License & Version History
* **Status:** Active
* **Changes:**
  - **1. Unlimited Workflow Version History:**
    - Updated `packages/cli/src/license.ts` to return `UNLIMITED_LICENSE_QUOTA` (`-1`) for `LICENSE_QUOTAS.WORKFLOW_HISTORY_PRUNE_LIMIT` and `'quota:workflowHistoryPrune'` in `getValue()` and `getWorkflowHistoryPruneLimit()`.
    - Removed the 1-day (24 hours) license prune limit, allowing full, unlimited version history retention locally.
    - Suppressed the `"Version history is limited to 1 day / Upgrade plan to activate full history"` upgrade footer banner across the UI.
  - **2. Named Versions Activation:**
    - Enabled `LICENSE_FEATURES.NAMED_VERSIONS` in `packages/cli/src/license.ts` by returning `true` in `isLicensed()`.
    - Enabled `enterprise.namedVersions` in `packages/cli/src/services/frontend.service.ts` so users can name and manage workflow history versions.
  - **3. Workflow Diffs Activation:**
    - Enabled `LICENSE_FEATURES.WORKFLOW_DIFFS` in `packages/cli/src/license.ts` by returning `true` in `isLicensed()`.
    - Enabled `enterprise.workflowDiffs` in `packages/cli/src/services/frontend.service.ts` so users can compare version diffs side-by-side.

* **Files:**
  - `packages/cli/src/license.ts`
  - `packages/cli/src/services/frontend.service.ts`

* **Notes:**
  - Version history is now fully unlocked without paywall limitations: infinite history retention, version naming, and visual workflow diff comparisons are available locally out of the box.

## Upgrade Notes

* [ ] Verify license checks remain unlocked after upstream master merges
* [ ] Review conflicts in modified files during upstream master merges
