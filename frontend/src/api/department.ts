import { api } from "@/lib/api";

export type Department = {
	id: number;
	name: string;
	description?: string | null;
};

export type DepartmentEmployees = {
	id: number;
	name: string;
	description?: string | null;
	employeeCount?: number;
	employees?: { id: string; fullName: string }[];
};

export type Paginated<T> = {
	items: T[];
	pagination: {
		totalItems: number;
		itemCount: number;
		itemsPerPage: number;
		totalPages: number;
		currentPage: number;
	};
};

export type PaginationQuery = {
	page?: number;
	limit?: number;
};

export type CreateDepartmentPayload = {
	name: string;
	description: string;
};

export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

type ApiSuccess<T> = { status: "SUCCESS"; data: T };

export async function getDepartments(
	query: PaginationQuery = {},
): Promise<Paginated<Department>> {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined) {
			search.set(key, String(value));
		}
	}

	const { data } = await api<ApiSuccess<Paginated<Department>>>(
		`/departments?${search.toString()}`,
	);
	return data;
}

export async function getDepartmentsEmployee(
	query: PaginationQuery = {},
): Promise<Paginated<DepartmentEmployees>> {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined) {
			search.set(key, String(value));
		}
	}

	const { data } = await api<ApiSuccess<Paginated<DepartmentEmployees>>>(
		`/departments/full?${search.toString()}`,
	);
	return data;
}

export async function createDepartment(
	payload: CreateDepartmentPayload,
): Promise<Department> {
	const { data } = await api<ApiSuccess<Department>>("/departments", {
		method: "POST",
		body: JSON.stringify(payload),
	});
	return data;
}

export async function updateDepartment(
	id: string,
	payload: UpdateDepartmentPayload,
): Promise<Department> {
	const { data } = await api<ApiSuccess<Department>>(`/departments/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
	return data;
}

export async function deleteDepartment(id: number): Promise<void> {
	await api(`/departments/${id}`, {
		method: "DELETE",
	});
}
