import { useCallback, useEffect, useState } from "react";

import { getAttendance, type Attendance } from "@/api/attendances";

type FetchResult = {
	requestKey: string;
	data: Attendance | null;
	error: string | null;
};

/** GET /api/attendances/:id */
export function useAttendance(id: number) {
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<FetchResult | null>(null);

	const requestKey = `${id}|${reloadKey}`;

	useEffect(() => {
		let cancelled = false;

		getAttendance(id)
			.then((data) => {
				if (!cancelled) setResult({ requestKey, data, error: null });
			})
			.catch((cause: unknown) => {
				if (!cancelled) {
					setResult({
						requestKey,
						data: null,
						error:
							cause instanceof Error
								? cause.message
								: "Failed to load attendance",
					});
				}
			});

		return () => {
			cancelled = true;
		};
	}, [id, reloadKey, requestKey]);

	const current = result?.requestKey === requestKey ? result : null;
	const reload = useCallback(() => setReloadKey((key) => key + 1), []);

	return {
		attendance: current?.data ?? null,
		loading: current === null,
		error: current?.error ?? null,
		reload,
	};
}
