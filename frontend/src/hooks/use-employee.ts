import { useCallback, useEffect, useState } from "react";

import { getEmployeeDetail, type User } from "@/api/users";

type FetchResult = {
	requestKey: string;
	user: User | null;
	error: string | null;
};

/** GET /api/users/:id */
export function useEmployee(id: string | undefined) {
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<FetchResult | null>(null);

	const requestKey = `${id ?? ""}|${reloadKey}`;

	useEffect(() => {
		if (!id) return;

		let cancelled = false;

		getEmployeeDetail(id)
			.then((user) => {
				if (!cancelled) setResult({ requestKey, user, error: null });
			})
			.catch((cause: unknown) => {
				if (!cancelled) {
					setResult({
						requestKey,
						user: null,
						error:
							cause instanceof Error
								? cause.message
								: "Could not load employee",
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
		user: current?.user ?? null,
		loading: Boolean(id) && current === null,
		error: current?.error ?? null,
		reload,
	};
}
