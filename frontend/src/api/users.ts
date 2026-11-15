import { api } from "@/lib/api";

export type User = {
	id: string;
	fullName: string;
	email: string;
	department?: {
		id: number;
		name: string;
	} | null;
	role: string;
	gender: string;
	phone?: string | null;
	createdAt: string;
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

export type CreateUserPayload = {
	fullName: string;
	email: string;
	password: string;
	role: "ADMIN" | "EMPLOYEE";
	departmentId: number;
	gender: "MALE" | "FEMALE";
	phone?: string;
	isActive?: boolean;
};

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">> & {
	password?: string;
};

type ApiSuccess<T> = { status: "SUCCESS"; data: T };

export async function getEmployees(
	query: PaginationQuery = {},
): Promise<Paginated<User>> {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined) {
			search.set(key, String(value));
		}
	}

	const { data } = await api<ApiSuccess<Paginated<User>>>(
		`/users?${search.toString()}`,
	);
	return data;
}

export async function getEmployeeDetail(id: string): Promise<User> {
	const { data } = await api<ApiSuccess<User>>(`/users/${id}`);
	return data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
	const { data } = await api<ApiSuccess<User>>("/users", {
		method: "POST",
		body: JSON.stringify(payload),
	});
	return data;
}

export async function updateUser(
	id: string,
	payload: UpdateUserPayload,
): Promise<User> {
	const { data } = await api<ApiSuccess<User>>(`/users/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
	return data;
}

/** DELETE /api/users/:id (ADMIN only) */
export async function deleteUser(id: string): Promise<void> {
	await api(`/users/${id}`, {
		method: "DELETE",
	});
}
