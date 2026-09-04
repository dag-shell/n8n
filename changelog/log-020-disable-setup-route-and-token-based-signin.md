# Log 020: Disable Setup Route & Implement Headless Token-Based Signin

## Context
In embedded and multi-tenant setups where n8n is managed by an external control panel, standard initial instance onboarding (`/setup`) and manual email/password login forms on `/signin` are redundant and expose internal auth mechanisms to users. This update eliminates the `/setup` route entirely, hides the manual login UI on `/signin`, and implements URL query-parameter-based authentication token ingestion with automatic cookie assignment, session validation, and target/fallback redirection.

## Changes Made

1. **Elimination of `/setup` Route**:
   - In `packages/frontend/editor-ui/src/app/router.ts`:
     - Replaced the `/setup` route handler with a direct redirect to `/signin`.
     - Removed the global navigation guard checking `settingsStore.showSetupPage` that previously intercepted unauthenticated routes and forced a redirect to `/setup`.
   - In `packages/cli/src/services/frontend.service.ts`:
     - Permanently set `getShowSetupOnFirstLoad()` to return `false`.
   - In `packages/@n8n/stores/src/settings.store.ts`:
     - Hardcoded `showSetupPage` to evaluate to `false`.

2. **Headless Signin Architecture on `/signin`**:
   - In `packages/frontend/editor-ui/src/features/core/auth/views/SigninView.vue`:
     - Completely removed the manual login form (`AuthView`, password/email inputs, SSO buttons, and MFA view).
     - Rendered a centered loading spinner during session verification without any locked screens or credentials forms.
     - Extracted authentication token from URL query parameters and assigned it to the auth cookie.
     - Validated session with backend via `usersStore.loginWithCookie()`.
     - On success: redirects using safe `redirect` query parameter or forwards to `/home/overview`.
     - On failure: redirects to configured failure fallback URL.

3. **Guest Middleware Compatibility**:
   - In `packages/frontend/editor-ui/src/app/utils/rbac/middleware/guest.ts`:
     - Added a bypass when token query parameter is present so incoming authentication requests are processed without being redirected prematurely by guest guards.

## Files Modified
- `packages/cli/src/services/frontend.service.ts`
- `packages/@n8n/stores/src/settings.store.ts`
- `packages/frontend/editor-ui/src/app/router.ts`
- `packages/frontend/editor-ui/src/app/utils/rbac/middleware/guest.ts`
- `packages/frontend/editor-ui/src/features/core/auth/views/SigninView.vue`
- `changelog/log-020-disable-setup-route-and-token-based-signin.md`
