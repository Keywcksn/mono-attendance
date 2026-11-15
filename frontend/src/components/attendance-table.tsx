import { format } from "date-fns";
import {
	CalendarX2,
	ChevronLeft,
	ChevronRight,
	Eye,
	Pencil,
} from "lucide-react";

import type { Attendance } from "@/api/attendances";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AttendanceStatusPill } from "@/components/attendance-status-pill";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	useAttendances,
	type AttendanceRange,
	type AttendanceScope,
} from "@/hooks/use-attendances";
import { formatAttendanceTime } from "@/lib/attendance-meta";
import { getInitials } from "@/lib/user";

const PAGE_SIZE = 10;

type AttendanceTableProps = {
	date: Date;
	page: number;
	onPageChange: (page: number) => void;
	/** `all` = team records (ADMIN), `mine` = the signed-in user's records. */
	scope?: AttendanceScope;
	/** Limit to one employee (ADMIN scope only). */
	userId?: string;
	/** Day view (default) or a full month. */
	range?: AttendanceRange;
	onView?: (record: Attendance) => void;
	onEdit?: (record: Attendance) => void;
};

export function AttendanceTable({
	date,
	page,
	onPageChange,
	scope = "all",
	userId,
	range = "day",
	onView,
	onEdit,
}: AttendanceTableProps) {
	const { items, pagination, loading, refreshing, error, reload } =
		useAttendances(date, page, PAGE_SIZE, scope, { userId, range });

	const total = pagination?.totalItems ?? 0;
	const currentPage = pagination?.currentPage ?? page;
	const totalPages = pagination?.totalPages ?? 1;

	return (
		<Card className="min-w-0">
			<CardHeader className="border-b">
				<CardTitle>Attendance records</CardTitle>
				<CardDescription>
					{range === "month"
						? format(date, "MMMM yyyy")
						: format(date, "EEEE, MMMM d, yyyy")}{" "}
					·{" "}
					{loading
						? "loading…"
						: refreshing
							? "updating…"
							: `${total} ${total === 1 ? "record" : "records"}`}
				</CardDescription>
			</CardHeader>
			<CardContent className="px-0">
				{error ? (
					<div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
						<div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
							<CalendarX2 className="size-5" />
						</div>
						<p className="text-sm font-medium">Could not load attendance</p>
						<p className="max-w-xs text-sm text-muted-foreground">{error}</p>
						<Button variant="outline" size="sm" onClick={reload}>
							Try again
						</Button>
					</div>
				) : loading ? (
					<div className="flex flex-col gap-4 px-4 py-4">
						{Array.from({ length: 5 }, (_, index) => (
							<div key={index} className="flex items-center gap-3">
								<Skeleton className="size-8 shrink-0 rounded-full" />
								<div className="flex flex-col gap-1.5">
									<Skeleton className="h-3.5 w-40" />
									<Skeleton className="h-3 w-24" />
								</div>
								<Skeleton className="ml-auto h-4 w-14" />
								<Skeleton className="h-4 w-14" />
								<Skeleton className="h-5 w-20 rounded-full" />
							</div>
						))}
					</div>
				) : items.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
						<div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
							<CalendarX2 className="size-5" />
						</div>
						<p className="text-sm font-medium">
							{range === "month"
								? "No records for this month"
								: "No records for this day"}
						</p>
						<p className="max-w-xs text-sm text-muted-foreground">
							{range === "month"
								? "Pick another month to view attendance."
								: "Pick a date from the calendar to view that day's attendance."}
						</p>
					</div>
				) : (
					<>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="px-4">Employee</TableHead>
									<TableHead className="px-4">Check in</TableHead>
									<TableHead className="px-4">Check out</TableHead>
									<TableHead className="px-4">Status</TableHead>
									<TableHead className="px-4 text-center">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{items.map((record) => {
									const name = record.user?.fullName ?? "Unknown employee";
									const department = record.user?.department?.name ?? "—";

									return (
										<TableRow key={record.id}>
											<TableCell className="px-4 py-3">
												<div className="flex items-center gap-3">
													<Avatar>
														<AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
															{getInitials(name)}
														</AvatarFallback>
													</Avatar>
													<div className="flex flex-col leading-tight">
														<span className="font-medium">{name}</span>
														<span className="text-xs text-muted-foreground">
															{department}
														</span>
													</div>
												</div>
											</TableCell>
											<TableCell className="px-4 tabular-nums">
												{formatAttendanceTime(record.checkInTime)}
											</TableCell>
											<TableCell className="px-4 tabular-nums">
												{formatAttendanceTime(record.checkOutTime)}
											</TableCell>
											<TableCell className="px-4">
												<AttendanceStatusPill status={record.status} />
											</TableCell>
											<TableCell className="px-4">
												<div className="flex items-center justify-center gap-1">
													{onView && (
														<Button
															variant="ghost"
															size="icon"
															title="View"
															aria-label={`View ${name}`}
															onClick={() => onView(record)}
														>
															<Eye />
														</Button>
													)}
													{onEdit && (
														<Button
															variant="ghost"
															size="icon"
															title="Edit"
															aria-label={`Edit ${name}`}
															onClick={() => onEdit(record)}
														>
															<Pencil />
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>

						{(totalPages > 1 || currentPage > 1) && (
							<div className="flex items-center justify-between gap-3 border-t px-4 py-3">
								<span className="text-sm text-muted-foreground">
									Page {currentPage} of {totalPages}
								</span>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										disabled={loading || refreshing || currentPage <= 1}
										onClick={() => onPageChange(currentPage - 1)}
									>
										<ChevronLeft />
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={
											loading || refreshing || currentPage >= totalPages
										}
										onClick={() => onPageChange(currentPage + 1)}
									>
										Next
										<ChevronRight />
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
