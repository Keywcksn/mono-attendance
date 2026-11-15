import { useState } from "react";
import { useNavigate } from "react-router";

import { AttendanceSummary } from "@/components/attendance-summary";
import { AttendanceTable } from "@/components/attendance-table";
import { CheckInCard } from "@/components/check-in-card";
import { getStoredUser } from "@/lib/user";
import { MonthFilter } from "@/components/month-filter";

export default function MyAttendancePage() {
	const navigate = useNavigate();
	const [today] = useState(() => new Date());
	const [page, setPage] = useState(1);
	// Bumped after check-in/out so the summary and table refetch.
	const [refreshKey, setRefreshKey] = useState(0);
	const user = getStoredUser();
	const name = user?.fullName ?? "User";
	const [month, setMonth] = useState(() => new Date());

	function handleChangeMonth(next: Date) {
		setMonth(next);
		setPage(1);
	}

	return (
		<>
			<div className="flex flex-col gap-1">
				<h1 className="font-heading text-2xl font-semibold tracking-tight">
					Hi, {name}!
				</h1>
				<p className="text-sm text-muted-foreground">
					Check in and out for today, then review your own attendance history.
				</p>
			</div>

			<AttendanceSummary key={`summary-${refreshKey}`} />

			<div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
				{/* Sidebar: first on mobile (primary action), right column on xl */}
				<div className="flex flex-col gap-6 xl:order-2">
					<CheckInCard
						date={today}
						onChanged={() => setRefreshKey((key) => key + 1)}
					/>
				</div>

				<div className="flex min-w-0 flex-col gap-4 xl:order-1">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h2 className="text-lg font-semibold">History</h2>
						<MonthFilter month={month} onChange={handleChangeMonth} />
					</div>
					<AttendanceTable
						key={`table-${refreshKey}`}
						date={month}
						page={page}
						onPageChange={setPage}
						scope="mine"
						range="month"
						onView={(record) => navigate(`/my-attendance/${record.id}`)}
					/>
				</div>
			</div>
		</>
	);
}
