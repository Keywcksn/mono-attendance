import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { updateUser } from "@/api/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserForm, type UserFormValues } from "@/components/user-form";
import { useEmployee } from "@/hooks/use-employee";

function FormSkeleton() {
	return (
		<Card className="max-w-full">
			<CardContent className="grid gap-4 py-6 sm:grid-cols-2">
				{Array.from({ length: 6 }, (_, index) => (
					<div key={index} className="grid gap-2">
						<Skeleton className="h-3 w-20" />
						<Skeleton className="h-9 w-full" />
					</div>
				))}
			</CardContent>
		</Card>
	);
}

export default function EditUserPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user, loading, error, reload } = useEmployee(id);

	const backTo = id ? `/employees/${id}` : "/employees";

	async function handleUpdate(values: UserFormValues) {
		if (!id) return;

		await updateUser(id, {
			fullName: values.fullName.trim(),
			email: values.email.trim(),
			role: values.role,
			gender: values.gender,
			departmentId: Number(values.departmentId),
			phone: values.phone.trim(),
		});

		navigate(backTo, { replace: true });
	}

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
					Back to employee
				</Button>
				<h1 className="font-heading text-2xl font-semibold tracking-tight">
					{user ? `Edit ${user.fullName}` : "Edit employee"}
				</h1>
				<p className="text-sm text-muted-foreground">
					Update this employee&apos;s profile and department.
				</p>
			</div>

			{!id ? (
				<p className="text-sm text-destructive">Invalid employee id.</p>
			) : loading ? (
				<FormSkeleton />
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
				<UserForm
					mode="edit"
					initialValues={{
						fullName: user.fullName,
						email: user.email,
						role: user.role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
						gender: user.gender === "FEMALE" ? "FEMALE" : "MALE",
						departmentId: user.department ? String(user.department.id) : "",
						phone: user.phone ?? "",
					}}
					onSubmit={handleUpdate}
					onCancel={() => navigate(backTo)}
				/>
			) : null}
		</>
	);
}
