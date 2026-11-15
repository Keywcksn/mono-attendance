import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import {
	deleteUser,
	getEmployees,
	type Paginated,
	type User,
} from "@/api/users";
import { UserCard, UserCardSkeleton } from "@/components/user-card";
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
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

type Pagination = Paginated<User>["pagination"];

type FetchResult = {
	requestKey: string;
	users: User[];
	pagination: Pagination | null;
	error: string | null;
};

export default function UsersPage() {
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	// Bumped after a delete (or retry) so the list refetches.
	const [refreshKey, setRefreshKey] = useState(0);
	const [result, setResult] = useState<FetchResult | null>(null);

	const [toDelete, setToDelete] = useState<User | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	// Loading is derived: a result only counts if it belongs to this request.
	const requestKey = `${page}|${refreshKey}`;

	useEffect(() => {
		let cancelled = false; // ignore stale responses

		getEmployees({ page, limit: PAGE_SIZE })
			.then((response) => {
				if (!cancelled) {
					setResult({
						requestKey,
						users: response.items,
						pagination: response.pagination,
						error: null,
					});
				}
			})
			.catch((cause: unknown) => {
				if (!cancelled) {
					setResult({
						requestKey,
						users: [],
						pagination: null,
						error:
							cause instanceof Error
								? cause.message
								: "Could not load employees",
					});
				}
			});

		return () => {
			cancelled = true;
		};
	}, [page, refreshKey, requestKey]);

	const current = result?.requestKey === requestKey ? result : null;
	const users = current?.users ?? [];
	const pagination = current?.pagination ?? null;
	const loading = current === null;
	const error = current?.error ?? "";

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
			await deleteUser(toDelete.id);
			setToDelete(null);
			setRefreshKey((key) => key + 1);
		} catch (cause) {
			setDeleteError(
				cause instanceof Error ? cause.message : "Could not delete employee",
			);
		} finally {
			setDeleting(false);
		}
	}

	const total = pagination?.totalItems ?? 0;
	const totalPages = pagination?.totalPages ?? 1;
	const currentPage = pagination?.currentPage ?? page;
	const showEmpty = !loading && !error && users.length === 0;

	return (
		<>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex flex-col gap-1">
					<h1 className="font-heading text-2xl font-semibold tracking-tight">
						Employees
					</h1>
					<p className="text-sm text-muted-foreground">
						{loading
							? "Loading employees…"
							: `${total} employee${total === 1 ? "" : "s"} across departments`}
					</p>
				</div>
				<Button onClick={() => navigate("/employees/new")}>
					<Plus />
					New employee
				</Button>
			</div>

			{error ? (
				<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setRefreshKey((key) => key + 1)}
					>
						Try again
					</Button>
				</div>
			) : loading ? (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{Array.from({ length: 6 }, (_, index) => (
						<UserCardSkeleton key={index} />
					))}
				</div>
			) : showEmpty ? (
				<div className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
					No employees found.
				</div>
			) : (
				<>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{users.map((user) => (
							<UserCard
								key={user.id}
								user={user}
								onView={(employee) => navigate(`/employees/${employee.id}`)}
								onEdit={(employee) =>
									navigate(`/employees/${employee.id}/edit`)
								}
								onDelete={(employee) => {
									setDeleteError(null);
									setToDelete(employee);
								}}
							/>
						))}
					</div>

					{(totalPages > 1 || currentPage > 1) && (
						<div className="flex items-center justify-between gap-3">
							<span className="text-sm text-muted-foreground">
								Page {currentPage} of {totalPages}
							</span>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={page <= 1}
									onClick={() => setPage((value) => value - 1)}
								>
									<ChevronLeft />
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={page >= totalPages}
									onClick={() => setPage((value) => value + 1)}
								>
									Next
									<ChevronRight />
								</Button>
							</div>
						</div>
					)}
				</>
			)}

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
						<AlertDialogTitle>Delete employee?</AlertDialogTitle>
						<AlertDialogDescription>
							{toDelete
								? `This permanently deletes ${toDelete.fullName} (${toDelete.email}). This cannot be undone.`
								: "This permanently deletes the employee. This cannot be undone."}
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
