import { useCallback, useEffect, useState } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";

import {
	getAttendances,
	getMyAttendances,
	type Attendance,
	type Paginated,
} from "@/api/attendances";

export type AttendanceScope = "all" | "mine";

type FetchResult = {
	requestKey: string;
	data: Paginated<Attendance> | null;
	error: string | null;
};

/**
 * Fetches attendance records for a single day from GET /api/attendances.
 * Responses are paginated by the backend; `limit` is capped at 100 there.
 */
export function useAttendances(
	date: Date,
	page = 1,
	limit = 25,
	scope: AttendanceScope = "all",
) {
	const dateKey = format(date, "yyyy-MM-dd");

	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<FetchResult | null>(null);

	// Loading is derived: a result only counts if it belongs to this request.
	const requestKey = `${scope}|${dateKey}|${page}|${limit}|${reloadKey}`;

	useEffect(() => {
		let cancelled = false; // ignore stale responses when the date/page changes

		const request =
			scope === "mine"
				? getMyAttendances({
						from: format(startOfMonth(date), "yyyy-MM-dd"),
						to: format(endOfMonth(date), "yyyy-MM-dd"),
						page,
						limit,
					})
				: getAttendances({ from: dateKey, to: dateKey, page, limit });

		request
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
	}, [scope, dateKey, page, limit, requestKey]);

	const current = result?.requestKey === requestKey ? result : null;
	const reload = useCallback(() => setReloadKey((key) => key + 1), []);

	return {
		items: current?.data?.items ?? [],
		pagination: current?.data?.pagination ?? null,
		loading: current === null,
		error: current?.error ?? null,
		reload,
	};
}
