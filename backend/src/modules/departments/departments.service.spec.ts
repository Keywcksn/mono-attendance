import { Test, type TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DepartmentsService } from "./departments.service";
import { Department } from "./entities/department.entity";
import { User } from "../users/entities/user.entity";

describe("DepartmentsService", () => {
	let service: DepartmentsService;
	const departmentRepo = {
		find: vi.fn(),
		findOne: vi.fn(),
		count: vi.fn(),
		create: vi.fn(),
		save: vi.fn(),
	};
	const userRepo = { createQueryBuilder: vi.fn(), manager: { createQueryBuilder: vi.fn() } };

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DepartmentsService,
				{ provide: getRepositoryToken(Department), useValue: departmentRepo },
				{ provide: getRepositoryToken(User), useValue: userRepo },
			],
		}).compile();

		service = module.get<DepartmentsService>(DepartmentsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
