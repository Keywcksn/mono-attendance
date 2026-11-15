import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import { deleteAttendance, type Attendance } from "@/api/attendances";
import { AttendanceCalendar } from "@/components/attendance-calendar";
import { AttendanceSummary } from "@/components/attendance-summary";
import { AttendanceTable } from "@/components/attendance-table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AttendancePage() {
	const navigate = useNavigate();
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [page, setPage] = useState(1);
	// Bumped after a delete so the summary and table refetch.
	const [refreshKey, setRefreshKey] = useState(0);

	const [toDelete, setToDelete] = useState<Attendance | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	function handleSelectDate(date: Date) {
		setSelectedDate(date);
		setPage(1); // a different day starts at the first page
	}

	function closeDeleteDialog() {
		if (deleting) return;
		setToDelete(null);
		setDeleteError(null);
	}

	async function handleDelete() {
		if (!toDelete) return;

		setDeleting(true);
		setDeleteError(null);

		try {
			await deleteAttendance(toDelete.id);
			setToDelete(null);
			setRefreshKey((key) => key + 1);
		} catch (cause) {
			setDeleteError(
				cause instanceof Error ? cause.message : "Could not delete attendance",
			);
		} finally {
			setDeleting(false);
		}
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

			<AttendanceSummary key={`summary-${refreshKey}`} />

			<div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_auto]">
				<AttendanceTable
					key={`table-${refreshKey}`}
					date={selectedDate}
					page={page}
					onPageChange={setPage}
					onView={(record) => navigate(`/attendance/${record.id}`)}
					onDelete={(record) => {
						setDeleteError(null);
						setToDelete(record);
					}}
				/>
				<AttendanceCalendar
					selectedDate={selectedDate}
					onSelectDate={handleSelectDate}
				/>
			</div>

			<AlertDialog
				open={toDelete !== null}
				onOpenChange={(open) => {
					if (!open) closeDeleteDialog();
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia className="bg-destructive/10 text-destructive">
							<Trash2 />
						</AlertDialogMedia>
						<AlertDialogTitle>Delete attendance record?</AlertDialogTitle>
						<AlertDialogDescription>
							{toDelete
								? `This permanently deletes ${toDelete.user?.fullName ?? "this employee"}'s record for ${format(parseISO(toDelete.date), "MMMM d, yyyy")}, including its check-in and check-out photos. This cannot be undone.`
								: "This permanently deletes the attendance record. This cannot be undone."}
						</AlertDialogDescription>
					</AlertDialogHeader>

					{deleteError && (
						<p role="alert" className="text-sm text-destructive">
							{deleteError}
						</p>
					)}

					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={deleting}
							onClick={() => void handleDelete()}
						>
							{deleting ? "Deleting…" : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
