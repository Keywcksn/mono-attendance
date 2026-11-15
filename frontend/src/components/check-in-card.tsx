import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
	Camera,
	Check,
	Clock,
	LoaderCircle,
	LogIn,
	LogOut,
} from "lucide-react";
import { CameraCapture } from "@/components/camera-capture";
import { TimeTile } from "@/components/time-tile";
import { checkIn, checkOut } from "@/api/attendances";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardAction,
} from "@/components/ui/card";
import { useAttendances } from "@/hooks/use-attendances";
import {
	attendanceStatusStyles,
	formatAttendanceTime,
} from "@/lib/attendance-meta";
import { cn } from "@/lib/utils";

function useNow() {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);
	return now;
}

function formatDuration(minutes: number) {
	return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

type CheckInCardProps = {
	date: Date;
	/** Called after a successful check-in/out so the page can refresh its data. */
	onChanged: () => void;
};

export function CheckInCard({ date, onChanged }: CheckInCardProps) {
	const {
		items,
		loading,
		error: fetchError,
		reload,
	} = useAttendances(date, 1, 1, "mine");
	const record = items[0];
	const now = useNow();

	const [uploading, setUploading] = useState(false);
	const [cameraOpen, setCameraOpen] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);

	const checkedIn = Boolean(record?.checkInTime);
	const checkedOut = Boolean(record?.checkOutTime);
	const actionLabel = checkedOut
		? "Completed for today"
		: checkedIn
			? "Check out"
			: "Check in";

	async function submit(file: File) {
		setActionError(null);
		setUploading(true);
		try {
			if (checkedIn) await checkOut(file);
			else await checkIn(file);
			reload();
			onChanged();
		} catch (cause) {
			setActionError(
				cause instanceof Error ? cause.message : "Could not record attendance",
			);
		} finally {
			setUploading(false);
		}
	}

	const statusStyle = record?.status
		? attendanceStatusStyles[record.status]
		: null;

	return (
		<Card>
			<CardHeader className="border-b">
				<CardTitle>Today&apos;s attendance</CardTitle>
				<CardDescription>{format(date, "EEEE, MMMM d, yyyy")}</CardDescription>
				<CardAction className="flex items-center gap-3">
					{statusStyle && (
						<span
							className={cn(
								"inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium whitespace-nowrap",
								statusStyle.className,
							)}
						>
							{statusStyle.label}
						</span>
					)}
					<span className="flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
						<Clock className="size-4" />
						{format(now, "HH:mm:ss")}
					</span>
				</CardAction>
			</CardHeader>

			<CardContent className="flex flex-col gap-4">
				<div className="grid gap-3">
					<TimeTile
						icon={LogIn}
						label="Check in"
						value={loading ? "…" : formatAttendanceTime(record?.checkInTime)}
						done={checkedIn}
					/>
					<TimeTile
						icon={LogOut}
						label="Check out"
						value={loading ? "…" : formatAttendanceTime(record?.checkOutTime)}
						done={checkedOut}
					/>
				</div>

				{checkedOut && record && record.duration > 0 && (
					<p className="text-sm text-muted-foreground">
						Total worked:{" "}
						<span className="font-medium text-foreground">
							{formatDuration(record.duration)}
						</span>
					</p>
				)}

				<CameraCapture
					open={cameraOpen}
					onOpenChange={setCameraOpen}
					onCapture={submit}
				/>
				<Button
					size="lg"
					variant={checkedOut ? "outline" : "default"}
					className={cn(
						"w-full",
						!checkedIn &&
							!checkedOut &&
							"bg-emerald-600 text-white hover:bg-emerald-700",
					)}
					onClick={() => setCameraOpen(true)}
					disabled={loading || uploading || checkedOut || Boolean(fetchError)}
				>
					{uploading ? (
						<LoaderCircle className="animate-spin" />
					) : checkedOut ? (
						<Check />
					) : (
						<Camera />
					)}
					{uploading ? "Uploading…" : actionLabel}
				</Button>

				<p className="text-center text-xs text-muted-foreground">
					{checkedOut
						? "Both check-in and check-out are recorded."
						: "A photo is required to verify your attendance."}
				</p>

				{(actionError ?? fetchError) && (
					<p
						role="alert"
						className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
					>
						{actionError ?? fetchError}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
