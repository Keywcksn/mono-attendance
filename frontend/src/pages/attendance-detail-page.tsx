import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { AttendanceDetail } from "@/components/attendance-detail";
import { Button } from "@/components/ui/button";
import { getStoredUser } from "@/lib/user";

export default function AttendanceDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const user = getStoredUser();
	const backTo = user?.role === "EMPLOYEE" ? "/my-attendance" : "/attendance";
	const backLabel =
		user?.role === "EMPLOYEE" ? "Back to my attendance" : "Back to attendance";

	const numericId = Number(id);
	const validId = Number.isInteger(numericId) && numericId > 0;

	return (
		<>
			<div className="flex flex-col gap-1">
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 w-fit text-muted-foreground"
					onClick={() => navigate(backTo)}
				>
					<ArrowLeft />
					{backLabel}
				</Button>
				<h1 className="font-heading text-2xl font-semibold tracking-tight">
					Attendance detail
				</h1>
				<p className="text-sm text-muted-foreground">
					Check-in and check-out details, with verification photos.
				</p>
			</div>

			{validId ? (
				<AttendanceDetail id={numericId} />
			) : (
				<p className="text-sm text-destructive">Invalid attendance id.</p>
			)}
      
		</>
	);
}
