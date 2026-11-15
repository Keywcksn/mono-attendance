import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DepartmentsController } from "./departments.controller";
import { DepartmentsService } from "./departments.service";

describe("DepartmentsController", () => {
	let controller: DepartmentsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [DepartmentsController],
			providers: [
				{
					provide: DepartmentsService,
					useValue: {
						create: vi.fn(),
						findAll: vi.fn(),
						findOne: vi.fn(),
						findWithEmployees: vi.fn(),
						update: vi.fn(),
						remove: vi.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<DepartmentsController>(DepartmentsController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});
});
