import { format, parseISO } from "date-fns";
import { LogIn, LogOut } from "lucide-react";

import type { Attendance } from "@/api/attendances";
import { AttendanceStatusPill } from "@/components/attendance-status-pill";
import { TimeTile } from "@/components/time-tile";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	formatAttendanceDuration,
	formatAttendanceTime,
} from "@/lib/attendance-meta";

/**
 * Attendance summary card, styled like the employee check-in card: status in
 * the header, icon tiles for check-in/out, and total worked time.
 */
export function AttendanceInfoCard({
	attendance,
}: {
	attendance: Attendance;
}) {
	const name = attendance.user?.fullName ?? "Unknown employee";
	const department = attendance.user?.department?.name ?? "No department";
	const checkedIn = Boolean(attendance.checkInTime);
	const checkedOut = Boolean(attendance.checkOutTime);
	const hasDuration = checkedOut && attendance.duration > 0;

	return (
		<Card className="h-full">
			<CardHeader className="border-b">
				<CardTitle className="truncate">{name}</CardTitle>
				<CardDescription className="truncate">
					{department} ·{" "}
					{format(parseISO(attendance.date), "d MMMM, yyyy")}
				</CardDescription>
				<CardAction>
					<AttendanceStatusPill status={attendance.status} />
				</CardAction>
			</CardHeader>

			<CardContent className="flex flex-col gap-4">
				<div className="grid gap-3">
					<TimeTile
						icon={LogIn}
						label="Check in"
						value={formatAttendanceTime(attendance.checkInTime)}
						done={checkedIn}
					/>
					<TimeTile
						icon={LogOut}
						label="Check out"
						value={formatAttendanceTime(attendance.checkOutTime)}
						done={checkedOut}
					/>
				</div>

				<div className="rounded-lg bg-muted/50 p-4">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Total worked
					</p>
					<p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
						{hasDuration ? formatAttendanceDuration(attendance.duration) : "—"}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

export function AttendanceInfoCardSkeleton() {
	return (
		<Card>
			<CardHeader className="border-b">
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-4 w-52" />
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid gap-3">
					<Skeleton className="h-[66px] w-full rounded-lg" />
					<Skeleton className="h-[66px] w-full rounded-lg" />
				</div>
				<Skeleton className="h-4 w-32" />
			</CardContent>
		</Card>
	);
}
