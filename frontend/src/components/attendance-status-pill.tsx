import type { AttendanceStatus } from "@/api/attendances";
import { attendanceStatusStyles } from "@/lib/attendance-meta";
import { cn } from "@/lib/utils";

export function AttendanceStatusPill({
	status,
}: {
	status: AttendanceStatus | null;
}) {
	if (!status) return <span className="text-muted-foreground">—</span>;

	const style = attendanceStatusStyles[status];
	return (
		<span
			className={cn(
				"inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium whitespace-nowrap",
				style.className,
			)}
		>
			{style.label}
		</span>
	);
}
