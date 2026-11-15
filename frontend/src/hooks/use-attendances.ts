import { useCallback, useEffect, useState } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";

import {
	getAttendances,
	getMyAttendances,
	type Attendance,
	type Paginated,
} from "@/api/attendances";

export type AttendanceScope = "all" | "mine";
export type AttendanceRange = "day" | "month";

type UseAttendancesOptions = {
	/** One employee's records; only used with scope="all" (ADMIN). */
	userId?: string;
	range?: AttendanceRange;
};

type FetchResult = {
	requestKey: string;
	/** Scope + employee, so stale rows are never shown across different users. */
	identity: string;
	data: Paginated<Attendance> | null;
	error: string | null;
};

/**
 * Fetches attendance records for a day or a month from GET /api/attendances
 * (or GET /api/attendances/mine for the signed-in employee).
 */
export function useAttendances(
	date: Date,
	page = 1,
	limit = 25,
	scope: AttendanceScope = "all",
	{ userId, range = "day" }: UseAttendancesOptions = {},
) {
	const from = format(
		range === "month" ? startOfMonth(date) : date,
		"yyyy-MM-dd",
	);
	const to = format(range === "month" ? endOfMonth(date) : date, "yyyy-MM-dd");

	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<FetchResult | null>(null);

	// Loading is derived: a result only counts if it belongs to this request.
	const identity = `${scope}|${userId ?? ""}`;
	const requestKey = `${identity}|${from}|${to}|${page}|${limit}|${reloadKey}`;

	useEffect(() => {
		let cancelled = false; // ignore stale responses when the query changes

		const request =
			scope === "mine"
				? getMyAttendances({ from, to, page, limit })
				: getAttendances({ from, to, page, limit, userId });

		request
			.then((data) => {
				if (!cancelled) setResult({ requestKey, identity, data, error: null });
			})
			.catch((cause: unknown) => {
				if (!cancelled) {
					setResult({
						requestKey,
						identity,
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
	}, [scope, from, to, page, limit, userId, identity, requestKey]);

	const current = result?.requestKey === requestKey ? result : null;
	const reload = useCallback(() => setReloadKey((key) => key + 1), []);

	// Keep the previous page visible while the next query loads. This avoids a
	// skeleton/height flash (and momentary scrollbar) when switching months.
	const refreshing = result !== null && current === null;
	const staleData = result?.identity === identity ? result.data : null;
	const data = current?.data ?? staleData ?? null;
	const loading = result === null || (refreshing && data === null);

	return {
		items: data?.items ?? [],
		pagination: data?.pagination ?? null,
		loading,
		refreshing: refreshing && !loading,
		error: current?.error ?? null,
		reload,
	};
}
