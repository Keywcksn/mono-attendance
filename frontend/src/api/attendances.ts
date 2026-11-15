import { api } from "@/lib/api";

export type AttendanceStatus =
	"present" | "absent" | "late" | "on_leave" | "overtime";

export type Attendance = {
	id: number;
	userId: string;
	/** YYYY-MM-DD */
	date: string;
	checkInTime: string | null;
	checkOutTime: string | null;
	status: AttendanceStatus | null;
	/** Worked minutes */
	duration: number;
	/** Relative path under /uploads (e.g. `attendance/2026-11-14-in-....jpg`). */
	checkInPhoto: string | null;
	checkOutPhoto: string | null;
	createdAt: string;
	updatedAt: string;
	user?: {
		id: string;
		fullName: string;
		department?: { id: number; name: string };
	};
};

export type Paginated<T> = {
	items: T[];
	pagination: {
		totalItems: number;
		itemCount: number;
		itemsPerPage: number;
		totalPages: number;
		currentPage: number;
	};
};

/** Every successful backend response is wrapped by ResponseInterceptor. */
type ApiSuccess<T> = { status: "SUCCESS"; data: T };

export type AttendanceQuery = {
	page?: number;
	limit?: number;
	userId?: string;
	status?: AttendanceStatus;
	/** YYYY-MM-DD */
	from?: string;
	/** YYYY-MM-DD */
	to?: string;
};

export type AttendanceSummary = Record<AttendanceStatus, number>;

/**
 * GET /api/attendances (ADMIN only)
 *
 * The bearer token is attached by the shared client in `@/lib/api`.
 */
export async function getAttendances(
	query: AttendanceQuery = {},
): Promise<Paginated<Attendance>> {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined) {
			search.set(key, String(value));
		}
	}

	const { data } = await api<ApiSuccess<Paginated<Attendance>>>(
		`/attendances?${search.toString()}`,
	);
	return data;
}

export async function getSummary(): Promise<AttendanceSummary> {
	const { data } = await api<ApiSuccess<AttendanceSummary>>(
		"/attendances/summary",
	);
	return data;
}

/** GET /api/attendances/:id */
export async function getAttendance(id: number): Promise<Attendance> {
	const { data } = await api<ApiSuccess<Attendance>>(`/attendances/${id}`);
	return data;
}

export async function getMyAttendances(
	query: Omit<AttendanceQuery, "userId"> = {},
) {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined) search.set(key, String(value));
	}
	const { data } = await api<ApiSuccess<Paginated<Attendance>>>(
		`/attendances/mine?${search}`,
	);
	return data;
}

/** POST /api/attendances/check-in — multipart, field `photo` is required. */
export async function checkIn(photo: File): Promise<Attendance> {
	const body = new FormData();
	body.append("photo", photo);

	const { data } = await api<ApiSuccess<Attendance>>("/attendances/check-in", {
		method: "POST",
		body,
	});
	return data;
}

/** POST /api/attendances/check-out — multipart, field `photo` is required. */
export async function checkOut(photo: File): Promise<Attendance> {
	const body = new FormData();
	body.append("photo", photo);

	const { data } = await api<ApiSuccess<Attendance>>("/attendances/check-out", {
		method: "POST",
		body,
	});
	return data;
}
