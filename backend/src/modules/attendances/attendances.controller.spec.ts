import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AttendancesController } from "./attendances.controller";
import { AttendanceService } from "./attendances.service";

describe("AttendancesController", () => {
	let controller: AttendancesController;
	const attendanceService = {
		checkIn: vi.fn(),
		checkOut: vi.fn(),
		findAll: vi.fn(),
		findOne: vi.fn(),
		findMine: vi.fn(),
		summarize: vi.fn(),
		delete: vi.fn(),
	};

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AttendancesController],
			providers: [
				{ provide: AttendanceService, useValue: attendanceService },
			],
		}).compile();

		controller = module.get<AttendancesController>(AttendancesController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("delegates findAll with the parsed query", () => {
		const query = { page: 2, limit: 10, userId: "u1" };
		controller.findAll(query);

		expect(attendanceService.findAll).toHaveBeenCalledWith(query);
	});

	it("delegates findMine with the current user", () => {
		const query = { page: 1, limit: 10 };
		const req = {
			user: { sub: "u1", email: "u1@example.com", role: "EMPLOYEE" },
		};

		controller.findMine(query, req as never);

		expect(attendanceService.findMine).toHaveBeenCalledWith(query, "u1");
	});
});
