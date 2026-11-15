import { Eye, Pencil, Trash2, Ellipsis } from "lucide-react";

import type { User } from "@/api/users";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatRole, getInitials } from "@/lib/user";

type UserCardProps = {
	user: User;
	onView?: (user: User) => void;
	onEdit?: (user: User) => void;
	onDelete?: (user: User) => void;
};

export function UserCard({ user, onView, onEdit, onDelete }: UserCardProps) {
	const isAdmin = user.role === "ADMIN";

	return (
		<Card className="gap-3 py-4">
			{/* Row 1: person + actions */}
			<CardContent className="grid grid-cols-6 gap-3 items-top gap-3 px-4">
				<Avatar className="size-12">
					<AvatarFallback className="bg-emerald-50 text-xs font-medium text-emerald-700">
						{getInitials(user.fullName)}
					</AvatarFallback>
				</Avatar>

				<div className="flex min-w-0 flex-1 flex-col leading-tight col-span-4">
					<span className="truncate text-base font-medium">
						{user.fullName}
					</span>
					<span className="truncate text-xs text-muted-foreground">
						{user.email}
					</span>
				</div>
				<div className="flex shrink-0 justify-end gap-0.5">
					{(onView || onEdit || onDelete) && (
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={`Actions for ${user.fullName}`}
										className="text-muted-foreground"
									/>
								}
							>
								<Ellipsis />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{onView && (
									<DropdownMenuItem onClick={() => onView(user)}>
										<Eye /> View
									</DropdownMenuItem>
								)}
								{onEdit && (
									<DropdownMenuItem onClick={() => onEdit(user)}>
										<Pencil /> Edit
									</DropdownMenuItem>
								)}
								{(onView || onEdit) && onDelete && <DropdownMenuSeparator />}
								{onDelete && (
									<DropdownMenuItem
										variant="destructive"
										onClick={() => onDelete(user)}
									>
										<Trash2 /> Delete
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</CardContent>

			{/* Row 2: two columns */}
			<CardContent className="grid grid-cols-2 gap-3 border-t px-4 pt-3">
				<div className="flex min-w-0 flex-col gap-0.5 items-center">
					<span className="text-[11px] uppercase tracking-wide text-muted-foreground">
						Department
					</span>
					<span className="truncate text-sm">
						{user.department?.name ?? "—"}
					</span>
				</div>

				<div className="flex flex-col gap-0.5 items-center">
					<span className="text-[11px] uppercase tracking-wide text-muted-foreground">
						Role
					</span>
					<span
						className={cn(
							"inline-flex h-5 w-fit items-center rounded-full border px-2 text-xs font-medium",
							isAdmin
								? "border-violet-200 bg-violet-50 text-violet-700"
								: "border-sky-200 bg-sky-50 text-sky-700",
						)}
					>
						{formatRole(user.role)}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

export function UserCardSkeleton() {
	return (
		<Card className="gap-3 py-4">
			{/* Row 1: avatar + name/email + ellipsis */}
			<CardContent className="grid grid-cols-6 items-center gap-3 px-4">
				<Skeleton className="size-12 rounded-full" />

				<div className="col-span-4 flex min-w-0 flex-col gap-1.5">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-44" />
				</div>

				<Skeleton className="size-7 justify-self-end rounded-md" />
			</CardContent>

			{/* Row 2: department + role */}
			<CardContent className="grid grid-cols-2 gap-3 border-t px-4 pt-3">
				<div className="flex flex-col items-center gap-1.5">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-4 w-24" />
				</div>
				<div className="flex flex-col items-center gap-1.5">
					<Skeleton className="h-3 w-10" />
					<Skeleton className="h-5 w-16 rounded-full" />
				</div>
			</CardContent>
		</Card>
	);
}
