import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import type { JwtPayload } from "../auth/auth.types";

describe("UsersController", () => {
	let controller: UsersController;
	const usersService = {
		create: vi.fn(),
		findAll: vi.fn(),
		findOne: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
	};

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [{ provide: UsersService, useValue: usersService }],
		}).compile();

		controller = module.get<UsersController>(UsersController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("delegates create to the service", async () => {
		const dto = {
			fullName: "Ada",
			email: "ada@example.com",
			password: "Password123!",
			role: "EMPLOYEE",
			gender: "FEMALE",
			departmentId: 1,
			isActive: true,
		};
		usersService.create.mockResolvedValue({ id: "u1", ...dto });

		await controller.create(dto);

		expect(usersService.create).toHaveBeenCalledWith(dto);
	});

	it("lets an employee read only their own profile", () => {
		const req = {
			user: { sub: "me", email: "me@example.com", role: "EMPLOYEE" },
		} as { user: JwtPayload };

		controller.findOne("someone-else", req);

		expect(usersService.findOne).toHaveBeenCalledWith("me");
	});

	it("lets an admin read any profile", () => {
		const req = {
			user: { sub: "admin", email: "admin@example.com", role: "ADMIN" },
		} as { user: JwtPayload };

		controller.findOne("target-user", req);

		expect(usersService.findOne).toHaveBeenCalledWith("target-user");
	});
});
