const BASE = import.meta.env.VITE_API_URL ?? "/api";

/** Refresh shortly before expiry so requests never race a dead token. */
const REFRESH_SKEW_MS = 60_000;

export type Tokens = {
	accessToken: string;
	accessTokenExpiresAt: string;
};

/** Login also returns the user, so the UI can show it without another call. */
export type TokenResponse = Tokens & {
	fullName: string;
	role: string;
};

type Options = RequestInit & { skipAuthRefresh?: boolean };

let refreshPromise: Promise<string> | null = null;

function storeTokens(data: Tokens) {
	localStorage.setItem("token", data.accessToken);
	localStorage.setItem("tokenExpiresAt", data.accessTokenExpiresAt);
}

export function storeSession(data: TokenResponse) {
	storeTokens(data);
	localStorage.setItem(
		"user",
		JSON.stringify({ fullName: data.fullName, role: data.role }),
	);
}

export function clearSession() {
	localStorage.removeItem("user");
	localStorage.removeItem("token");
	localStorage.removeItem("tokenExpiresAt");
}

function redirectToLogin() {
	if (window.location.pathname !== "/login") {
		window.location.assign("/login");
	}
}

/**
 * POST /api/auth/refresh using the rotating httpOnly refresh cookie.
 * Single-flight: concurrent callers share one refresh request.
 */
export function refreshAccessToken(): Promise<string> {
	refreshPromise ??= (async () => {
		const res = await fetch(`${BASE}/auth/refresh`, {
			method: "POST",
			credentials: "include", // sends the refresh_token cookie
		});
		if (!res.ok) throw new Error("Session expired");

		const body = await res.json();
		const data: Tokens = body.data ?? body;
		// A refresh only rotates tokens; the stored user profile must be preserved.
		storeTokens(data);
		return data.accessToken;
	})().finally(() => {
		refreshPromise = null;
	});

	return refreshPromise;
}

function tokenExpiresWithin(skewMs: number) {
	const expiresAt = localStorage.getItem("tokenExpiresAt");
	if (!expiresAt) return false;

	const expires = new Date(expiresAt).getTime();
	return Number.isFinite(expires) && expires - Date.now() <= skewMs;
}

/** Returns a token with at least `REFRESH_SKEW_MS` left, refreshing if needed. */
async function getAccessToken(): Promise<string | null> {
	const token = localStorage.getItem("token");
	if (!token) return null;
	if (!tokenExpiresWithin(REFRESH_SKEW_MS)) return token;

	try {
		return await refreshAccessToken();
	} catch {
		clearSession();
		redirectToLogin();
		return null;
	}
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
	const { skipAuthRefresh = false, ...init } = options;

	const doFetch = (token: string | null) => {
		// Let the browser set the multipart boundary for FormData bodies.
		const isFormData = init.body instanceof FormData;

		return fetch(`${BASE}${path}`, {
			...init,
			credentials: "include",
			headers: {
				...(!isFormData && { "Content-Type": "application/json" }),
				...(token && { Authorization: `Bearer ${token}` }),
				...init.headers,
			},
		});
	};

	const token = skipAuthRefresh
		? localStorage.getItem("token")
		: await getAccessToken();

	let res = await doFetch(token);

	// Fallback: the token may have been revoked or the clock skewed.
	if (res.status === 401 && !skipAuthRefresh) {
		try {
			res = await doFetch(await refreshAccessToken());
		} catch {
			clearSession();
			redirectToLogin();
			throw new Error("Session expired");
		}
	}

	if (res.status === 204) return undefined as T;

	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(body?.data?.message ?? res.statusText);
	}

	return (await res.json()) as T;
}
