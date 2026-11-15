import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type TimeTileProps = {
	icon: LucideIcon;
	label: string;
	value: string;
	done: boolean;
};

/** Icon + label + time tile used by the check-in card and attendance detail. */
export function TimeTile({ icon: Icon, label, value, done }: TimeTileProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-lg border p-3",
				!done && "bg-muted/40",
			)}
		>
			<div
				className={cn(
					"flex size-9 shrink-0 items-center justify-center rounded-full",
					done
						? "bg-emerald-50 text-emerald-700"
						: "bg-muted text-muted-foreground",
				)}
			>
				<Icon className="size-4" />
			</div>
			<div className="flex flex-col leading-tight">
				<span className="text-xs text-muted-foreground">{label}</span>
				<span className="text-lg font-semibold tabular-nums">{value}</span>
			</div>
		</div>
	);
}
