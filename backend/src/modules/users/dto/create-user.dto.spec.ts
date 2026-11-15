import "reflect-metadata";

import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { CreateUserDto } from "./create-user.dto";

const valid = {
	fullName: "Ada Lovelace",
	email: "ada@example.com",
	password: "Password123!",
	role: "EMPLOYEE",
	gender: "FEMALE",
	departmentId: 2,
	isActive: true,
};

async function validatePayload(payload: Record<string, unknown>) {
	const dto = plainToInstance(CreateUserDto, payload);
	return { dto, errors: await validate(dto) };
}

describe("CreateUserDto", () => {
	it("accepts a valid payload", async () => {
		const { errors } = await validatePayload(valid);
		expect(errors).toHaveLength(0);
	});

	it("requires departmentId", async () => {
		const { departmentId: _departmentId, ...withoutDepartment } = valid;
		const { errors } = await validatePayload(withoutDepartment);

		expect(errors.some((error) => error.property === "departmentId")).toBe(true);
	});

	it("coerces departmentId to a number", async () => {
		const { dto, errors } = await validatePayload({
			...valid,
			departmentId: "2",
		});

		expect(errors).toHaveLength(0);
		expect(dto.departmentId).toBe(2);
	});

	it("rejects an unknown role", async () => {
		const { errors } = await validatePayload({ ...valid, role: "SUPERUSER" });

		expect(errors.some((error) => error.property === "role")).toBe(true);
	});

	it("accepts isActive true (new users are created active)", async () => {
		const { errors } = await validatePayload({ ...valid, isActive: true });
		expect(errors).toHaveLength(0);
	});
});
