import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import AppLayout from "@/components/app-layout";
import ProtectedRoute from "@/components/protected-route";
import RequireRole from "@/components/require-role";
import { getStoredUser } from "@/lib/user";
import AttendancePage from "@/pages/attendance-page";
import AttendanceDetailPage from "@/pages/attendance-detail-page";
import DepartmentsPage from "@/pages/departments-page";
import EditUserPage from "@/pages/edit-user-page";
import LoginPage from "@/pages/login-page";
import MyAttendancePage from "@/pages/my-attendance-page";
import NewUserPage from "@/pages/new-user-page";
import UserDetailPage from "@/pages/user-detail-page";
import UsersPage from "@/pages/users-page";

/** Sends signed-in users to the home page that matches their role. */
function RoleRedirect() {
	const user = getStoredUser();

	if (!user) return <Navigate to="/login" replace />;

	return (
		<Navigate
			to={user.role === "EMPLOYEE" ? "/my-attendance" : "/attendance"}
			replace
		/>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />

				<Route element={<ProtectedRoute />}>
					<Route element={<AppLayout />}>
						<Route element={<RequireRole role="ADMIN" />}>
							<Route path="/attendance" element={<AttendancePage />} />
							<Route
								path="/attendance/:id"
								element={<AttendanceDetailPage />}
							/>
							<Route path="/employees" element={<UsersPage />} />
							<Route path="/employees/new" element={<NewUserPage />} />
							<Route path="/employees/:id" element={<UserDetailPage />} />
							<Route path="/employees/:id/edit" element={<EditUserPage />} />
							<Route path="/departments" element={<DepartmentsPage />} />
						</Route>

						<Route element={<RequireRole role="EMPLOYEE" />}>
							<Route path="/my-attendance" element={<MyAttendancePage />} />
							<Route
								path="/my-attendance/:id"
								element={<AttendanceDetailPage />}
							/>
						</Route>
					</Route>
				</Route>

				<Route path="*" element={<RoleRedirect />} />
			</Routes>
		</BrowserRouter>
	);
}
