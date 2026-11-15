import { useEffect, useState } from "react";
import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type CameraCaptureProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCapture: (file: File) => void;
};

export function CameraCapture({
	open,
	onOpenChange,
	onCapture,
}: CameraCaptureProps) {
	const [video, setVideo] = useState<HTMLVideoElement | null>(null); // callback ref: the dialog mounts lazily
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Start the camera when the dialog opens, stop it when it closes
	useEffect(() => {
		if (!open) return;
		let active: MediaStream | null = null;
		let cancelled = false;
		setError(null);

		navigator.mediaDevices
			?.getUserMedia({ video: { facingMode: "user" }, audio: false })
			.then((s) => {
				if (cancelled) return s.getTracks().forEach((t) => t.stop());
				active = s;
				setStream(s);
			})
			.catch(() =>
				setError(
					"Camera unavailable. Allow camera access in your browser settings.",
				),
			);

		if (!navigator.mediaDevices)
			setError("Camera requires HTTPS or localhost.");

		return () => {
			cancelled = true;
			active?.getTracks().forEach((t) => t.stop());
			setStream(null);
		};
	}, [open]);

	useEffect(() => {
		if (video) video.srcObject = stream;
	}, [video, stream]);

	function capture() {
		if (!video || !video.videoWidth) return;
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas.getContext("2d")?.drawImage(video, 0, 0);
		canvas.toBlob(
			(blob) => {
				if (!blob) return;
				onCapture(
					new File([blob], `attendance-${Date.now()}.jpg`, {
						type: "image/jpeg",
					}),
				);
				onOpenChange(false);
			},
			"image/jpeg",
			0.85,
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Take a photo</DialogTitle>
				</DialogHeader>

				{error ? (
					<p role="alert" className="py-8 text-center text-sm text-destructive">
						{error}
					</p>
				) : (
					<video
						ref={setVideo}
						autoPlay
						playsInline
						muted
						className="aspect-[4/3] w-full -scale-x-100 rounded-lg bg-black object-cover" // mirrored preview only
					/>
				)}

				<Button
					onClick={capture}
					disabled={!stream || Boolean(error)}
					size="lg"
				>
					<Camera /> Capture
				</Button>
			</DialogContent>
		</Dialog>
	);
}
