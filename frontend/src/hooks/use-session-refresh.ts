import { useEffect } from "react";

import { clearSession, refreshAccessToken } from "@/lib/api";

const CHECK_INTERVAL_MS = 30_000;
const REFRESH_SKEW_MS = 60_000;

/**
 * Keeps the 15-minute access token fresh while the app is open: checks every
 * 30s and rotates the token one minute before it expires. Refresh requests are
 * single-flight with the ones `api()` makes, so the cookie is never used twice.
 */
export function useSessionRefresh() {
	useEffect(() => {
		if (!localStorage.getItem("token")) return;

		let stopped = false;

		const check = async () => {
			const expiresAt = localStorage.getItem("tokenExpiresAt");
			if (!expiresAt) return;

			const expires = new Date(expiresAt).getTime();
			if (!Number.isFinite(expires) || expires - Date.now() > REFRESH_SKEW_MS) {
				return;
			}

			try {
				await refreshAccessToken();
			} catch {
				if (stopped) return;

				clearSession();
				if (window.location.pathname !== "/login") {
					window.location.assign("/login");
				}
			}
		};

		void check();
		const interval = window.setInterval(check, CHECK_INTERVAL_MS);

		return () => {
			stopped = true;
			window.clearInterval(interval);
		};
	}, []);
}
