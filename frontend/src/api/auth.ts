import { api, clearSession, storeSession } from "@/lib/api";

type ApiSuccess<T> = { status: "SUCCESS"; data: T };

/** Shape returned by POST /api/auth/login (see AuthController.login). */
type LoginResponse = {
	id: string;
	fullName: string;
	role: string;
	accessToken: string;
	accessTokenExpiresAt: string;
};

export type LoginPayload = {
	email: string;
	password: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
	// Login is protected by ApiKeyGuard on the backend (x-api-key header).
	const apiKey = import.meta.env.VITE_API_KEY;

	const { data } = await api<ApiSuccess<LoginResponse>>("/auth/login", {
		method: "POST",
		body: JSON.stringify(payload),
		// A failed login must show the backend's message, not trigger a refresh.
		skipAuthRefresh: true,
		...(apiKey ? { headers: { "x-api-key": apiKey } } : {}),
	});

	storeSession(data);
	return data;
}

export async function logout(): Promise<void> {
	try {
		// Clears the rotating refresh-token cookie on the server.
		await api("/auth/logout", { method: "POST", skipAuthRefresh: true });
	} catch {
		// A dead cookie/session shouldn't block logging out locally.
	} finally {
		clearSession();
	}
}
