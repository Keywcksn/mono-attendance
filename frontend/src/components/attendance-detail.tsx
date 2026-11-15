import { useState } from "react";
import { ImageOff } from "lucide-react";

import {
	AttendanceInfoCard,
	AttendanceInfoCardSkeleton,
} from "@/components/attendance-info-card";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendance } from "@/hooks/use-attendance";
import {
	attendancePhotoUrl,
	formatAttendanceTime,
} from "@/lib/attendance-meta";

type PhotoPanelProps = {
	title: string;
	time: string | null | undefined;
	path: string | null | undefined;
};

function PhotoPanel({ title, time, path }: PhotoPanelProps) {
	const url = attendancePhotoUrl(path);
	const [failedUrl, setFailedUrl] = useState<string | null>(null);
	const showImage = url !== null && failedUrl !== url;

	return (
		<Card>
			<CardHeader className="border-b">
				<CardTitle>{title}</CardTitle>
				<CardDescription>
					Captured at {formatAttendanceTime(time)}
				</CardDescription>
			</CardHeader>
			<CardContent className="p-4">
				{showImage ? (
					<a
						href={url}
						target="_blank"
						rel="noreferrer"
						title={`Open ${title.toLowerCase()} full size`}
						className="block overflow-hidden rounded-lg border"
					>
						<img
							src={url}
							alt={`${title} for this attendance`}
							className="aspect-[4/3] w-full bg-muted object-cover transition-transform hover:scale-[1.01]"
							onError={() => setFailedUrl(url)}
						/>
					</a>
				) : (
					<div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
						<ImageOff className="size-6" />
						<span className="text-sm">No photo available</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function DetailSkeleton() {
	return (
		<div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
			<AttendanceInfoCardSkeleton />
			<div className="grid gap-6 md:grid-cols-2">
				<Skeleton className="h-64 w-full rounded-xl" />
				<Skeleton className="h-64 w-full rounded-xl" />
			</div>
		</div>
	);
}

export function AttendanceDetail({ id }: { id: number }) {
	const { attendance, loading, error, reload } = useAttendance(id);

	if (loading) return <DetailSkeleton />;

	if (error || !attendance) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
					<p className="text-sm font-medium">Could not load attendance</p>
					<p className="max-w-sm text-sm text-muted-foreground">
						{error ?? "Attendance not found"}
					</p>
					<Button variant="outline" size="sm" onClick={reload}>
						Try again
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            {/* Summary card: top on smaller screens, right on xl */}
            <AttendanceInfoCard attendance={attendance}/>

            {/* Photos: below on smaller screens, left on xl */}
            <div className="grid gap-6 md:grid-cols-2 md:order-last lg:order-first">
                <PhotoPanel
                    title="Check-in photo"
                    time={attendance.checkInTime}
                    path={attendance.checkInPhoto}
                />
                <PhotoPanel
                    title="Check-out photo"
                    time={attendance.checkOutTime}
                    path={attendance.checkOutPhoto}
                />
            </div>
        </div>
	);
}
