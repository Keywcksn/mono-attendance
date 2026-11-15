import { CalendarX2, Clock3, Plane, UserCheck } from "lucide-react";

import type { AttendanceStatus } from "@/api/attendances";
import { Card, CardContent } from "@/components/ui/card";
import { useAttendanceSummary } from "@/hooks/use-attendance-summary";
import { cn } from "@/lib/utils";

const summaryItems: {
	status: AttendanceStatus;
	label: string;
	icon: typeof UserCheck;
	tone: string;
}[] = [
	{
		status: "present",
		label: "Present",
		icon: UserCheck,
		tone: "bg-emerald-50 text-emerald-600",
	},
	{
		status: "late",
		label: "Late",
		icon: Clock3,
		tone: "bg-amber-50 text-amber-600",
	},
	{
		status: "absent",
		label: "Absent",
		icon: CalendarX2,
		tone: "bg-red-50 text-red-600",
	},
	{
		status: "on_leave",
		label: "On leave",
		icon: Plane,
		tone: "bg-sky-50 text-sky-600",
	},
];

export function AttendanceSummary() {
	const { summary, loading, error } = useAttendanceSummary();
	const ready = !loading && !error;

	return (
		<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
			{summaryItems.map((item) => (
				<Card key={item.status} size="sm">
					<CardContent className="flex flex-row items-center justify-between gap-4">
						<div className="flex flex-col gap-1">
							<span className="text-sm text-muted-foreground">
								{item.label}
							</span>
							<span className="font-heading text-2xl font-semibold tabular-nums">
								{ready ? (summary?.[item.status] ?? 0) : "—"}
							</span>
						</div>
						<div
							className={cn(
								"flex size-9 shrink-0 items-center justify-center rounded-lg",
								item.tone,
							)}
						>
							<item.icon className="size-4" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
