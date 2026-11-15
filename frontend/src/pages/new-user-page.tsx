import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { createUser } from "@/api/users";
import { Button } from "@/components/ui/button";
import { UserForm, type UserFormValues } from "@/components/user-form";

export default function NewUserPage() {
	const navigate = useNavigate();

	async function handleCreate(values: UserFormValues) {
		const created = await createUser({
			fullName: values.fullName.trim(),
			email: values.email.trim(),
			password: values.password,
			role: values.role,
			gender: values.gender,
			departmentId: Number(values.departmentId),
			isActive: true,
			...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
		});

		navigate(`/employees/${created.id}`, { replace: true });
	}

	return (
		<>
			<div className="flex flex-col gap-1">
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 w-fit text-muted-foreground"
					onClick={() => navigate("/employees")}
				>
					<ArrowLeft />
					Back to employees
				</Button>
				<h1 className="font-heading text-2xl font-semibold tracking-tight">
					New employee
				</h1>
				<p className="text-sm text-muted-foreground">
					Create an account and assign its department and role.
				</p>
			</div>

			<UserForm
				mode="create"
				onSubmit={handleCreate}
				onCancel={() => navigate("/employees")}
			/>
		</>
	);
}
