import { Mail } from "lucide-react";

import type { User } from "@/api/users";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/user";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="grid gap-1">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className={cn("text-sm ", !value && "text-muted-foreground")}>
				{value || "Not provided"}
			</span>
		</div>
	);
}

export function UserInfoCard({ user }: { user: User }) {
	return (
		<Card>
			<CardHeader className="items-center justify-center gap-2 text-center">
				<Avatar className="size-30">
					<AvatarFallback className="bg-emerald-50 text-4xl font-semibold text-emerald-700">
						{getInitials(user.fullName)}
					</AvatarFallback>
				</Avatar>
				<div className="flex min-w-0 flex-col gap-0.5">
					<CardTitle className="truncate text-lg">{user.fullName}</CardTitle>
					<CardDescription className="truncate">
						{user.department?.name ?? "No department"}
					</CardDescription>
				</div>
			</CardHeader>

			<CardContent className="flex flex-col gap-3 text-sm">
				<div className="flex items-center gap-2">
					<Mail className="size-4 shrink-0 text-muted-foreground" />
					<span className="truncate">{user.email}</span>
				</div>

				<Separator />

				<InfoRow label="Gender" value={user.gender} />
				<InfoRow label="Phone number" value={user.phone} />
				<InfoRow
					label="Joined on"
					value={
						user.createdAt
							? format(new Date(user.createdAt), "d MMMM, yyyy")
							: "—"
					}
				/>
			</CardContent>
		</Card>
	);
}

export function UserInfoCardSkeleton() {
	return (
		<Card>
			<CardHeader className="items-center gap-2">
				<Skeleton className="size-16 rounded-full" />
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-3 w-24" />
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-px w-full" />
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-4 w-2/3" />
			</CardContent>
		</Card>
	);
}
