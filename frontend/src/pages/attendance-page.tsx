import { useState } from "react";
import { useNavigate } from "react-router";

import { AttendanceCalendar } from "@/components/attendance-calendar";
import { AttendanceSummary } from "@/components/attendance-summary";
import { AttendanceTable } from "@/components/attendance-table";

export default function AttendancePage() {
	const navigate = useNavigate();
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [page, setPage] = useState(1);

	function handleSelectDate(date: Date) {
		setSelectedDate(date);
		setPage(1); // a different day starts at the first page
	}

	return (
		<>
			<div className="flex flex-col gap-1">
				<h1 className="font-heading text-2xl font-semibold tracking-tight">
					Attendance
				</h1>
				<p className="text-sm text-muted-foreground">
					Monitor daily check-ins, late arrivals, and absences across the team.
				</p>
			</div>

			<AttendanceSummary />

			<div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_auto]">
				<AttendanceTable
					date={selectedDate}
					page={page}
					onPageChange={setPage}
					onView={(record) => navigate(`/attendance/${record.id}`)}
				/>
				<AttendanceCalendar
					selectedDate={selectedDate}
					onSelectDate={handleSelectDate}
				/>
			</div>
		</>
	);
}
