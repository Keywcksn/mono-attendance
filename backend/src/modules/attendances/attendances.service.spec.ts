import { Test, type TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AttendanceService } from "./attendances.service";
import { Attendance } from "./entities/attendance.entity";

const repo = {
	findOne: vi.fn(),
	find: vi.fn(),
	save: vi.fn(),
	create: vi.fn(),
	remove: vi.fn(),
	count: vi.fn(),
	createQueryBuilder: vi.fn(),
};

describe("AttendanceService", () => {
	let service: AttendanceService;

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AttendanceService,
				{ provide: getRepositoryToken(Attendance), useValue: repo },
			],
		}).compile();

		service = module.get<AttendanceService>(AttendanceService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("delete", () => {
		it("removes an existing record", async () => {
			const record = { id: 1 };
			repo.findOne.mockResolvedValue(record);
			repo.remove.mockResolvedValue(record);

			await service.delete(1);

			expect(repo.remove).toHaveBeenCalledWith(record);
		});

		it("throws NotFoundException when the record is missing", async () => {
			repo.findOne.mockResolvedValue(null);

			await expect(service.delete(999)).rejects.toBeInstanceOf(
				NotFoundException,
			);
		});
	});
});
