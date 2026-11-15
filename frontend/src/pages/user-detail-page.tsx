import { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { AttendanceTable } from "@/components/attendance-table";
import { MonthFilter } from "@/components/month-filter";
import {
	UserInfoCard,
	UserInfoCardSkeleton,
} from "@/components/user-info-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEmployee } from "@/hooks/use-employee";

export default function UserDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [month, setMonth] = useState(() => new Date());
	const [page, setPage] = useState(1);

	const { user, loading, error, reload } = useEmployee(id);

	function handleChangeMonth(next: Date) {
		setMonth(next);
		setPage(1);
	}

	return (
		<>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex flex-col gap-1">
					<Button
						variant="ghost"
						size="sm"
						className="-ml-2 w-fit text-muted-foreground"
						onClick={() => navigate("/employees")}
					>
						<ArrowLeft />
						Back to employees
					</Button>
					<h1 className="font-heading text-2xl font-semibold tracking-tight">
						{user?.fullName ?? "Employee detail"}
					</h1>
					<p className="text-sm text-muted-foreground">
						Monthly attendance record and employee information.
					</p>
				</div>
				{id && (
					<Button
						variant="outline"
						onClick={() => navigate(`/employees/${id}/edit`)}
					>
						<Pencil />
						Edit employee
					</Button>
				)}
			</div>

			<div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
				{/* Right column on xl, first on mobile. */}
				<div className="xl:order-2">
					{loading ? (
						<UserInfoCardSkeleton />
					) : error ? (
						<Card>
							<CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
								<p className="text-sm font-medium">Could not load employee</p>
								<p className="text-sm text-muted-foreground">{error}</p>
								<Button variant="outline" size="sm" onClick={reload}>
									Try again
								</Button>
							</CardContent>
						</Card>
					) : user ? (
						<UserInfoCard user={user} />
					) : null}
				</div>

				<div className="flex min-w-0 flex-col gap-4 xl:order-1">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h2 className="text-lg font-semibold">Attendance history</h2>
						<MonthFilter month={month} onChange={handleChangeMonth} />
					</div>

					{id ? (
						<AttendanceTable
							date={month}
							page={page}
							onPageChange={setPage}
							range="month"
							userId={id}
							onView={(record) => navigate(`/attendance/${record.id}`)}
						/>
					) : (
						<p className="text-sm text-destructive">Invalid employee id.</p>
					)}
				</div>
			</div>
		</>
	);
}
