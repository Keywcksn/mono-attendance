import { Navigate, Outlet } from "react-router";

import { getStoredUser } from "@/lib/user";

type Role = "ADMIN" | "EMPLOYEE";

/** Guards a route subtree; wrong-role users are sent to their own home page. */
export default function RequireRole({ role }: { role: Role }) {
	const user = getStoredUser();

	if (!user) return <Navigate to="/login" replace />;

	if (user.role !== role) {
		return (
			<Navigate
				to={user.role === "EMPLOYEE" ? "/my-attendance" : "/attendance"}
				replace
			/>
		);
	}

	return <Outlet />;
}
