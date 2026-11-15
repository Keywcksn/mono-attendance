import { format } from "date-fns";

import type { AttendanceStatus } from "@/api/attendances";

export const attendanceStatusStyles: Record<
	AttendanceStatus,
	{ label: string; className: string }
> = {
	present: {
		label: "Present",
		className: "border-emerald-200 bg-emerald-50 text-emerald-700",
	},
	late: {
		label: "Late",
		className: "border-amber-200 bg-amber-50 text-amber-700",
	},
	absent: {
		label: "Absent",
		className: "border-red-200 bg-red-50 text-red-700",
	},
	on_leave: {
		label: "On leave",
		className: "border-sky-200 bg-sky-50 text-sky-700",
	},
	overtime: {
		label: "Overtime",
		className: "border-violet-200 bg-violet-50 text-violet-700",
	},
};

/** Formats an ISO timestamp as local `HH:mm`, or `—` when missing/invalid. */
export function formatAttendanceTime(value: string | null | undefined) {
	if (!value) return "—";

	const time = new Date(value);
	return Number.isNaN(time.getTime()) ? "—" : format(time, "HH:mm");
}

/** Maps a stored photo path (e.g. `attendance/x.jpg`) to its public URL. */
export function attendancePhotoUrl(path: string | null | undefined) {
	if (!path) return null;
	return `/uploads/${path.replace(/^\/+/, "")}`;
}

/** Formats worked minutes as `2h 5m` / `45m`, or `—` when invalid. */
export function formatAttendanceDuration(minutes: number) {
	if (!Number.isFinite(minutes) || minutes < 0) return "—";

	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return hours ? `${hours}h ${rest}m` : `${rest}m`;
}
