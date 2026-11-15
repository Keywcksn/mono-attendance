import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle, Save } from "lucide-react";

import { getDepartments, type Department } from "@/api/department";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
	"h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm";

export type UserFormValues = {
	fullName: string;
	email: string;
	/** Empty in edit mode; the field is only rendered for create. */
	password: string;
	role: "ADMIN" | "EMPLOYEE";
	departmentId: string;
	gender: "MALE" | "FEMALE";
	phone: string;
};

const emptyValues: UserFormValues = {
	fullName: "",
	email: "",
	password: "",
	role: "EMPLOYEE",
	departmentId: "",
	gender: "MALE",
	phone: "",
};

type FieldProps = {
	label: string;
	htmlFor: string;
	error?: string;
	hint?: string;
	children: ReactNode;
};

function Field({ label, htmlFor, error, hint, children }: FieldProps) {
	return (
		<div className="grid gap-2">
			<Label htmlFor={htmlFor}>{label}</Label>
			{children}
			{error ? (
				<p className="text-xs text-destructive">{error}</p>
			) : hint ? (
				<p className="text-xs text-muted-foreground">{hint}</p>
			) : null}
		</div>
	);
}

type UserFormProps = {
	mode: "create" | "edit";
	initialValues?: Partial<UserFormValues>;
	onSubmit: (values: UserFormValues) => Promise<void>;
	onCancel: () => void;
};

/**
 * Shared employee form. Create renders a password field; edit pre-fills the
 * existing values and never touches the password.
 */
export function UserForm({
	mode,
	initialValues,
	onSubmit,
	onCancel,
}: UserFormProps) {
	const isCreate = mode === "create";

	const [form, setForm] = useState<UserFormValues>({
		...emptyValues,
		...initialValues,
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof UserFormValues, string>>
	>({});
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");

	const [departments, setDepartments] = useState<Department[]>([]);
	const [departmentsLoading, setDepartmentsLoading] = useState(true);
	const [departmentsError, setDepartmentsError] = useState("");
	const [departmentsKey, setDepartmentsKey] = useState(0);

	useEffect(() => {
		let cancelled = false;

		getDepartments({ limit: 100 })
			.then((result) => {
				if (cancelled) return;

				setDepartments(result.items);
				setDepartmentsError("");
				// Preselect the first department only when nothing is selected yet.
				setForm((current) =>
					current.departmentId || result.items.length === 0
						? current
						: { ...current, departmentId: String(result.items[0].id) },
				);
			})
			.catch((cause: unknown) => {
				if (!cancelled) {
					setDepartmentsError(
						cause instanceof Error
							? cause.message
							: "Could not load departments",
					);
				}
			})
			.finally(() => {
				if (!cancelled) setDepartmentsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [departmentsKey]);

	function update<K extends keyof UserFormValues>(
		key: K,
		value: UserFormValues[K],
	) {
		setForm((current) => ({ ...current, [key]: value }));
		setErrors((current) => ({ ...current, [key]: undefined }));
	}

	function retryDepartments() {
		setDepartmentsLoading(true);
		setDepartmentsError("");
		setDepartmentsKey((key) => key + 1);
	}

	function validate() {
		const next: Partial<Record<keyof UserFormValues, string>> = {};

		if (!form.fullName.trim()) next.fullName = "Full name is required.";
		if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
			next.email = "Enter a valid email address.";
		}
		if (isCreate && form.password.length < 8) {
			next.password = "Password must be at least 8 characters.";
		}
		if (!form.departmentId) next.departmentId = "Select a department.";

		setErrors(next);
		return Object.keys(next).length === 0;
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitError("");

		if (!validate()) return;

		setSubmitting(true);
		try {
			await onSubmit(form);
		} catch (cause) {
			setSubmitError(
				cause instanceof Error
					? cause.message
					: isCreate
						? "Could not create employee"
						: "Could not update employee",
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Card className="max-w-full">
			<CardHeader className="border-b">
				<CardTitle>Employee details</CardTitle>
				<CardDescription>
					{isCreate
						? "Enter the new employee's information."
						: "Update the employee's information. The password is unchanged."}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Full name" htmlFor="fullName" error={errors.fullName}>
							<Input
								id="fullName"
								autoComplete="name"
								value={form.fullName}
								onChange={(event) => update("fullName", event.target.value)}
								aria-invalid={Boolean(errors.fullName) || undefined}
								required
							/>
						</Field>

						<Field label="Email" htmlFor="email" error={errors.email}>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								value={form.email}
								onChange={(event) => update("email", event.target.value)}
								aria-invalid={Boolean(errors.email) || undefined}
								required
							/>
						</Field>

						{isCreate && (
							<Field
								label="Password"
								htmlFor="password"
								error={errors.password}
								hint="At least 8 characters."
							>
								<Input
									id="password"
									type="password"
									autoComplete="new-password"
									value={form.password}
									onChange={(event) => update("password", event.target.value)}
									aria-invalid={Boolean(errors.password) || undefined}
									required
								/>
							</Field>
						)}

						<Field label="Phone number" htmlFor="phone" hint="Optional.">
							<Input
								id="phone"
								type="tel"
								autoComplete="tel"
								maxLength={25}
								placeholder="+62 812 3456 7890"
								value={form.phone}
								onChange={(event) => update("phone", event.target.value)}
							/>
						</Field>

						<Field
							label="Department"
							htmlFor="department"
							error={errors.departmentId ?? departmentsError}
						>
							<select
								id="department"
								className={selectClass}
								value={form.departmentId}
								onChange={(event) =>
									update("departmentId", event.target.value)
								}
								disabled={departmentsLoading || Boolean(departmentsError)}
								aria-invalid={Boolean(errors.departmentId) || undefined}
								required
							>
								<option value="">
									{departmentsLoading
										? "Loading departments…"
										: "Select a department"}
								</option>
								{departments.map((department) => (
									<option key={department.id} value={department.id}>
										{department.name}
									</option>
								))}
							</select>
						</Field>

						<Field label="Role" htmlFor="role">
							<select
								id="role"
								className={selectClass}
								value={form.role}
								onChange={(event) =>
									update("role", event.target.value as UserFormValues["role"])
								}
							>
								<option value="EMPLOYEE">Employee</option>
								<option value="ADMIN">Admin</option>
							</select>
						</Field>

						<Field label="Gender" htmlFor="gender">
							<select
								id="gender"
								className={selectClass}
								value={form.gender}
								onChange={(event) =>
									update(
										"gender",
										event.target.value as UserFormValues["gender"],
									)
								}
							>
								<option value="MALE">Male</option>
								<option value="FEMALE">Female</option>
							</select>
						</Field>
					</div>

					{departmentsError && (
						<div className="flex flex-wrap items-center gap-3 text-sm text-destructive">
							<span>{departmentsError}</span>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={retryDepartments}
							>
								Retry
							</Button>
						</div>
					)}

					{submitError && (
						<p
							role="alert"
							className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
						>
							{submitError}
						</p>
					)}

					<div className="flex justify-end gap-2 border-t pt-4">
						<Button
							type="button"
							variant="outline"
							disabled={submitting}
							onClick={onCancel}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								submitting ||
								departmentsLoading ||
								Boolean(departmentsError)
							}
						>
							{submitting ? (
								<LoaderCircle className="animate-spin" />
							) : (
								<Save />
							)}
							{submitting
								? isCreate
									? "Creating…"
									: "Saving…"
								: isCreate
									? "Create employee"
									: "Save changes"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
