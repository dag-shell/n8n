# Log 021: Headless Auth Error Codes, Origin Redirection, Instant Loader, and API Playground

## Context
Following the elimination of the `/setup` and manual `/signin` routes for embedded deployments, authentication needed tighter contract enforcement, structured error reporting for host control panels, session expiration detection, zero-flicker loading, and developer tooling for testing auth flows. This update standardizes headless query parameters to `t` and `exp`, reports failures via `error_code` and `from` domain parameters, handles backend JWT expiration errors, adds an instant pre-mount 72px SVG spinner without custom backgrounds, and introduces an interactive auth test suite and API playground.

## Changes Made

1. **Headless Parameter Contract and Error Code Standardization**:
   - In `packages/frontend/editor-ui/src/features/core/auth/views/SigninView.vue`:
     - Standardized query parameter parsing to accept strictly `?t=<token>` (authentication JWT) and optional `?exp=<timestamp>` (expiration in seconds or milliseconds).
     - Removed legacy `?k=`, `?v=`, and `?m=` parameters. Cookie name is retrieved directly from `import.meta.env.VITE_AUTH_COOKIE_NAME` and failure URL from `import.meta.env.VITE_AUTH_FAILURE_REDIRECT_URL`.
     - Standardized fallback redirection to:
       `${fallbackUrl}?error_code=${errorCode}&from=${encodeURIComponent(window.location.origin)}`
     - Implemented granular error codes:
       - `TOKEN_EXPIRED`: JWT expiration timestamp (`exp`) has passed or route parameter `sessionExpired === 'true'`.
       - `TOKEN_NOT_ACTIVE`: JWT not-before (`nbf`) timestamp is in the future.
       - `INVALID_PAYLOAD`: Decoded JWT payload is missing mandatory user identity fields.
       - `MALFORMED_TOKEN`: Token cannot be parsed as a 3-part base64url JWT.
       - `MISSING_TOKEN`: No token provided when unauthenticated.
       - `EMPTY_TOKEN`: Token parameter `t` is present but blank.
       - `WRONG_PARAMETER_NAME`: Detected legacy or mismatched query parameters (`token`, `v`, `jwt`).
       - `BACKEND_UNAUTHORIZED`: Backend 401 response.
       - `BACKEND_FORBIDDEN`: Backend 403 response.
       - `USER_NOT_FOUND`: Backend 404 response.
       - `SERVER_ERROR`: Backend 500 response.
       - `CONNECTION_ERROR`: Backend unreachable.
     - Removed custom dark background CSS from `.container`, allowing the view to seamlessly inherit default application theming.
     - Enforced strict compliance with zero `||` logical operators throughout the script.

2. **Backend JWT Expiration and Error Responses**:
   - In `packages/cli/src/auth/auth.service.ts`:
     - Explicitly caught `TokenExpiredError` during cookie JWT verification.
     - Added `code: 'TOKEN_EXPIRED'` and `errorCode: 'TOKEN_EXPIRED'` to 401 JSON responses when tokens expire.
     - Cleanly cleared the auth cookie on expiration or JWT validation errors.
   - In `packages/@n8n/config/src/configs/user-management.config.ts`:
     - Set default `jwtSessionDurationHours` to 24 hours.
     - Set default `jwtRefreshTimeoutHours` to -1 to disable automatic rolling refresh, ensuring expired sessions prompt re-authentication.
   - In `packages/@n8n/config/test/config.test.ts`:
     - Updated unit tests to match new configuration defaults.

3. **Pre-mount Instant Loader and Unified Spinner**:
   - In `packages/frontend/editor-ui/index.html`:
     - Injected an inline 72px SVG spinner inside `<div id="app">`.
     - Appears on the very first HTML paint before Vue, Vite, or bundle scripts execute, eliminating blank or black screen flicker.
     - Removed custom `#181e29` background style to maintain native theme appearance.
   - In `packages/frontend/editor-ui/src/app/views/LoadingView.vue`:
     - Replaced legacy spinner with matching 72px SVG spinner using theme CSS variables (`--color--primary`, `--color--foreground--tint-2`).

4. **Environment Prefix and Router Token Extraction**:
   - In `packages/frontend/editor-ui/vite.config.mts`:
     - Added `'VITE'` to `envPrefix` to allow `VITE_AUTH_COOKIE_NAME` and `VITE_AUTH_FAILURE_REDIRECT_URL` to be exposed to client bundles.
   - In `packages/frontend/editor-ui/src/app/router.ts`:
     - Added early cookie assignment in the global `beforeEach` router guard when `to.query.t` is present, ensuring cookies are established before child navigation guards execute.

5. **Auth Testing Suite and API Playground**:
   - Created `test-auth-page.html`:
     - **Login & Forward Tab**: Form to execute `POST /rest/login` with credentials, inspect payload, and generate one-click `/signin?t=<token>&exp=<timestamp>` links.
     - **API Playground Tab**: REST client supporting standard presets (`POST /rest/login`, `GET /rest/login`, `GET /rest/users`, `POST /rest/logout`), custom headers, JSON body, response viewer, status code badges, and latency measurement.
     - **Redirect Listener Tab**: Intercepts fallback redirects and displays parsed `error_code` and `from` origin parameters.
     - **Cookie Inspector**: Real-time non-HttpOnly cookie viewer and token paste utility for handling browser `HttpOnly` security constraints during development.
     - Strictly constructed with zero `||` logical operators.

## Files Modified
- `packages/@n8n/config/src/configs/user-management.config.ts`
- `packages/@n8n/config/test/config.test.ts`
- `packages/cli/src/auth/auth.service.ts`
- `packages/frontend/editor-ui/index.html`
- `packages/frontend/editor-ui/src/app/router.ts`
- `packages/frontend/editor-ui/src/app/views/LoadingView.vue`
- `packages/frontend/editor-ui/src/features/core/auth/views/SigninView.vue`
- `packages/frontend/editor-ui/vite.config.mts`
- `test-auth-page.html`
- `changelog/log-021-headless-auth-error-codes-and-api-playground.md`
