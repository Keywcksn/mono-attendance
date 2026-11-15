import { useCallback, useEffect, useState } from "react";

import { getSummary, type AttendanceSummary } from "@/api/attendances";

type FetchResult = {
	reloadKey: number;
	data: AttendanceSummary | null;
	error: string | null;
};

/**
 * GET /api/attendances/summary
 *
 * The backend decides the range from the caller's role:
 * an ADMIN gets today's counts, an EMPLOYEE gets their current month.
 */
export function useAttendanceSummary() {
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<FetchResult | null>(null);

	useEffect(() => {
		let cancelled = false;

		getSummary()
			.then((data) => {
				if (!cancelled) setResult({ reloadKey, data, error: null });
			})
			.catch((cause: unknown) => {
				if (!cancelled) {
					setResult({
						reloadKey,
						data: null,
						error:
							cause instanceof Error
								? cause.message
								: "Failed to load attendance summary",
					});
				}
			});

		return () => {
			cancelled = true;
		};
	}, [reloadKey]);

	const current = result?.reloadKey === reloadKey ? result : null;
	const reload = useCallback(() => setReloadKey((key) => key + 1), []);

	return {
		summary: current?.data ?? null,
		loading: current === null,
		error: current?.error ?? null,
		reload,
	};
}
