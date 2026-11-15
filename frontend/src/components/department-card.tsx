import { Ellipsis, Eye, Pencil, Trash2 } from "lucide-react";

import type { DepartmentEmployees, Department } from "@/api/department";
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
import { getInitials } from "@/lib/user";

const MAX_AVATARS = 4;

type DepartmentCardProps = {
	department: DepartmentEmployees;
	onView?: (department: Department) => void;
	onEdit?: (department: Department) => void;
	onDelete?: (department: Department) => void;
};

export function DepartmentCard({
	department,
	onView,
	onEdit,
	onDelete,
}: DepartmentCardProps) {
	const people = department.employees ?? [];
	const total = department.employeeCount ?? people.length;
	const shown = people.slice(0, MAX_AVATARS);
	const extra = total - shown.length;

	return (
		<Card className="gap-3 py-4">
			<CardContent className="grid grid-cols-6 items-top gap-3 px-4">
				<div className="flex min-w-0 flex-1 flex-col col-span-5 gap-1 leading-tight">
					<span className="truncate text-base font-medium">
						{department.name}
					</span>
					<span className="line-clamp-2 text-sm text-muted-foreground">
						{department.description || "No description"}
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
										aria-label={`Actions for ${department.name}`}
										className="-mt-1 shrink-0 text-muted-foreground"
									/>
								}
							>
								<Ellipsis />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{onView && (
									<DropdownMenuItem onClick={() => onView(department)}>
										<Eye /> View
									</DropdownMenuItem>
								)}
								{onEdit && (
									<DropdownMenuItem onClick={() => onEdit(department)}>
										<Pencil /> Edit
									</DropdownMenuItem>
								)}
								{(onView || onEdit) && onDelete && <DropdownMenuSeparator />}
								{onDelete && (
									<DropdownMenuItem
										variant="destructive"
										onClick={() => onDelete(department)}
									>
										<Trash2 /> Delete
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</CardContent>

			{/* Bottom: overlapping initials + total */}
			<CardContent className="flex flex-col gap-2 border-t px-4 pt-3">
				<div className="flex items-center justify-between">
					<span className="text-[11px] uppercase tracking-wide text-muted-foreground">
						People
					</span>
					<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium tabular-nums text-foreground">
						{total}
					</span>
				</div>

				{total > 0 ? (
					<div className="flex items-center -space-x-2">
						{shown.map((p) => (
							<Avatar
								key={p.id}
								className="size-8 ring-2 ring-background"
								title={p.fullName}
							>
								<AvatarFallback className="bg-emerald-50 text-[11px] font-medium text-emerald-700">
									{getInitials(p.fullName)}
								</AvatarFallback>
							</Avatar>
						))}
						{extra > 0 && (
							<Avatar className="size-8 ring-2 ring-background">
								<AvatarFallback className="bg-muted text-[11px] font-medium text-muted-foreground">
									+{extra}
								</AvatarFallback>
							</Avatar>
						)}
					</div>
				) : (
					<span className="text-sm text-muted-foreground">No people yet</span>
				)}
			</CardContent>
		</Card>
	);
}

export function DepartmentCardSkeleton() {
	return (
		<Card className="gap-3 py-4">
			<CardContent className="flex items-start gap-3 px-4">
				<div className="flex flex-1 flex-col gap-2">
					<Skeleton className="h-4 w-36" />
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-2/3" />
				</div>
				<Skeleton className="size-7 shrink-0 rounded-md" />
			</CardContent>

			<CardContent className="flex items-center justify-between border-t px-4 pt-3">
				<div className="flex -space-x-2">
					{Array.from({ length: 3 }, (_, i) => (
						<Skeleton
							key={i}
							className="size-8 rounded-full ring-2 ring-background"
						/>
					))}
				</div>
				<Skeleton className="h-3 w-16" />
			</CardContent>
		</Card>
	);
}
