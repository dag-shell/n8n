<script lang="ts">
import type { LoginRequestDto } from '@n8n/api-types';

export type EmailOrLdapLoginIdAndPassword = Pick<
	LoginRequestDto,
	'emailOrLdapLoginId' | 'password'
>;

export type MfaCodeOrMfaRecoveryCode = Pick<LoginRequestDto, 'mfaCode' | 'mfaRecoveryCode'>;
</script>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@n8n/composables/useToast';
import { useUsersStore } from '@n8n/stores/users.store';
import { useSettingsStore } from '@n8n/stores/settings.store';
import { VIEWS } from '@/app/constants';

const AUTH_COOKIE_NAME = import.meta.env.VITE_AUTH_COOKIE_NAME;
const AUTH_FAILURE_REDIRECT_URL = import.meta.env.VITE_AUTH_FAILURE_REDIRECT_URL;

const toast = useToast();
const usersStore = useUsersStore();
const settingsStore = useSettingsStore();
const route = useRoute();
const router = useRouter();

const getRedirectQueryParameter = (): string => {
	if (typeof route.query?.redirect === 'string') {
		return decodeURIComponent(route.query.redirect);
	}
	return '';
};

const isRedirectSafe = (): boolean => {
	const redirect = getRedirectQueryParameter();
	if (!redirect) return false;

	// Allow local redirects
	if (redirect.startsWith('/')) {
		return true;
	}

	try {
		// Only allow origin domain redirects
		const url = new URL(redirect);
		return url.origin === window.location.origin;
	} catch {
		return false;
	}
};

const redirectToFallback = (fallbackUrl?: string, errorCode?: string) => {
	if (!fallbackUrl) return;
	const fromDomain = window.location.origin ? window.location.origin : window.location.host;
	try {
		const url = new URL(fallbackUrl, window.location.origin);
		if (url.origin === window.location.origin) {
			if (url.pathname === '/signin') {
				return;
			}
			if (url.pathname === window.location.pathname) {
				return;
			}
		}
		if (errorCode) {
			url.searchParams.set('error_code', errorCode);
		}
		if (fromDomain) {
			url.searchParams.set('from', fromDomain);
		}
		window.location.href = url.toString();
	} catch {
		let target = fallbackUrl;
		const hasQuery = fallbackUrl.includes('?');
		let sep = hasQuery ? '&' : '?';
		if (errorCode) {
			target += `${sep}error_code=${encodeURIComponent(errorCode)}`;
			sep = '&';
		}
		if (fromDomain) {
			target += `${sep}from=${encodeURIComponent(fromDomain)}`;
		}
		window.location.href = target;
	}
};

const handleSuccessRedirect = async () => {
	toast.clearAllStickyNotifications();

	if (settingsStore.isMFAEnforced && !usersStore.currentUser?.mfaAuthenticated) {
		await router.push({ name: VIEWS.PERSONAL_SETTINGS });
		return;
	}

	if (isRedirectSafe()) {
		const redirect = getRedirectQueryParameter();
		if (redirect.startsWith('http')) {
			window.location.href = redirect;
			return;
		}

		await router.push(redirect);
		return;
	}

	await router.push({ name: VIEWS.HOMEPAGE });
};

interface DecodedTokenInfo {
	payload: Record<string, unknown> | null;
	errorCode: string | null;
}

const parseJwt = (token: string): DecodedTokenInfo => {
	const parts = token.split('.');
	if (parts.length !== 3) {
		return {
			payload: null,
			errorCode: 'MALFORMED_TOKEN',
		};
	}

	try {
		const base64Url = parts[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
		const jsonStr = decodeURIComponent(
			atob(padded)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join(''),
		);
		const payload = JSON.parse(jsonStr) as Record<string, unknown>;

		if (typeof payload.exp === 'number') {
			const expMs = payload.exp * 1000;
			if (Date.now() >= expMs) {
				return {
					payload,
					errorCode: 'TOKEN_EXPIRED',
				};
			}
		}

		if (typeof payload.nbf === 'number' && Date.now() < payload.nbf * 1000) {
			return {
				payload,
				errorCode: 'TOKEN_NOT_ACTIVE',
			};
		}

		if (!payload.id) {
			return {
				payload,
				errorCode: 'INVALID_PAYLOAD',
			};
		}

		return { payload, errorCode: null };
	} catch {
		return {
			payload: null,
			errorCode: 'MALFORMED_TOKEN',
		};
	}
};

const getMissingTokenErrorCode = (): string => {
	if (typeof route.query.token === 'string') {
		return 'WRONG_PARAMETER_NAME';
	}
	if (typeof route.query.v === 'string') {
		return 'WRONG_PARAMETER_NAME';
	}
	if (typeof route.query.jwt === 'string') {
		return 'WRONG_PARAMETER_NAME';
	}
	const tVal = route.query.t;
	if (tVal !== undefined && typeof tVal === 'string' && tVal.trim() === '') {
		return 'EMPTY_TOKEN';
	}
	return 'MISSING_TOKEN';
};

const getBackendErrorCode = (error: unknown): string => {
	if (error instanceof Error) {
		if (error.message === "Can't connect to n8n.") {
			return 'CONNECTION_ERROR';
		}

		const err = error as {
			errorCode?: string;
			code?: string;
			httpStatusCode?: number;
			message?: string;
		};

		if (err.errorCode === 'TOKEN_EXPIRED') {
			return 'TOKEN_EXPIRED';
		}
		if (err.code === 'TOKEN_EXPIRED') {
			return 'TOKEN_EXPIRED';
		}
		if (err.message === 'jwt expired') {
			return 'TOKEN_EXPIRED';
		}

		const status = err.httpStatusCode;
		if (status === 401) {
			return 'BACKEND_UNAUTHORIZED';
		}
		if (status === 403) {
			return 'BACKEND_FORBIDDEN';
		}
		if (status === 404) {
			return 'USER_NOT_FOUND';
		}
		if (status === 500) {
			return 'SERVER_ERROR';
		}
	}

	return 'AUTH_FAILED';
};

const getCookieToken = (): string => {
	const cookies = document.cookie.split(';');
	const searchPrefix = `${AUTH_COOKIE_NAME}=`;
	for (let i = 0; i < cookies.length; i += 1) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith(searchPrefix)) {
			return decodeURIComponent(cookie.substring(searchPrefix.length));
		}
	}
	return '';
};

onMounted(async () => {
	if (!AUTH_COOKIE_NAME) {
		redirectToFallback(AUTH_FAILURE_REDIRECT_URL, 'MISSING_COOKIE_CONFIG');
		return;
	}

	if (route.query.sessionExpired === 'true') {
		redirectToFallback(AUTH_FAILURE_REDIRECT_URL, 'TOKEN_EXPIRED');
		return;
	}

	let t = '';
	if (typeof route.query.t === 'string') {
		t = route.query.t.trim();
	}

	let exp = '';
	if (typeof route.query.exp === 'string') {
		exp = route.query.exp.trim();
	}

	if (t) {
		const jwtInfo = parseJwt(t);
		if (jwtInfo.errorCode) {
			redirectToFallback(AUTH_FAILURE_REDIRECT_URL, jwtInfo.errorCode);
			return;
		}

		let expiresAttr = '';
		if (exp) {
			const numExp = Number(exp);
			if (!isNaN(numExp)) {
				const expDate = new Date(numExp < 1e11 ? numExp * 1000 : numExp);
				expiresAttr = `; expires=${expDate.toUTCString()}`;
			}
		}
		const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
		document.cookie = `${encodeURIComponent(AUTH_COOKIE_NAME)}=${t}; path=/; SameSite=Lax${expiresAttr}${secureAttr}`;

		if (usersStore.currentUser) {
			await handleSuccessRedirect();
			return;
		}

		try {
			await usersStore.loginWithCookie();
			await settingsStore.getSettings();
			await handleSuccessRedirect();
		} catch (error) {
			const errorCode = getBackendErrorCode(error);
			redirectToFallback(AUTH_FAILURE_REDIRECT_URL, errorCode);
		}
		return;
	}

	// User does not satisfy query parameters (token missing)
	if (usersStore.currentUser) {
		await handleSuccessRedirect();
		return;
	}

	const existingCookie = getCookieToken();
	if (existingCookie) {
		const cookieJwtInfo = parseJwt(existingCookie);
		if (cookieJwtInfo.errorCode) {
			redirectToFallback(AUTH_FAILURE_REDIRECT_URL, cookieJwtInfo.errorCode);
			return;
		}

		try {
			await usersStore.loginWithCookie();
			await settingsStore.getSettings();
			await handleSuccessRedirect();
			return;
		} catch (error) {
			const errorCode = getBackendErrorCode(error);
			redirectToFallback(AUTH_FAILURE_REDIRECT_URL, errorCode);
			return;
		}
	}

	const missingErrorCode = getMissingTokenErrorCode();
	redirectToFallback(AUTH_FAILURE_REDIRECT_URL, missingErrorCode);
});
</script>

<template>
	<div :class="$style.container">
		<div :class="$style.spinnerWrapper">
			<svg :class="$style.spinnerSvg" viewBox="0 0 50 50">
				<circle cx="25" cy="25" r="20" fill="none" class="track" stroke-width="4" />
				<circle
					cx="25"
					cy="25"
					r="20"
					fill="none"
					class="arc"
					stroke-width="4"
					stroke-linecap="round"
				/>
			</svg>
		</div>
	</div>
</template>

<style lang="scss" module>
.container {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	width: 100%;
}

.spinnerWrapper {
	display: flex;
	align-items: center;
	justify-content: center;
}

.spinnerSvg {
	width: 72px;
	height: 72px;
	animation: spin 1s linear infinite;

	:global(.track) {
		stroke: var(--color--foreground--tint-2, rgba(255, 255, 255, 0.15));
	}

	:global(.arc) {
		stroke: var(--color--primary, #ff6d5a);
		stroke-dasharray: 80;
		stroke-dashoffset: 60;
	}
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
