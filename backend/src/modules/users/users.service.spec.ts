import { Test, type TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";

const repo = {
	find: vi.fn(),
	findOne: vi.fn(),
	count: vi.fn(),
	create: vi.fn(),
	save: vi.fn(),
	remove: vi.fn(),
	createQueryBuilder: vi.fn(),
};

describe("UsersService", () => {
	let service: UsersService;

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{ provide: getRepositoryToken(User), useValue: repo },
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("create", () => {
		const dto = {
			fullName: "Ada Lovelace",
			email: "ada@example.com",
			password: "Password123!",
			role: "EMPLOYEE",
			gender: "FEMALE",
			departmentId: 2,
			isActive: true,
		};

		it("rejects an email that already exists", async () => {
			repo.findOne.mockResolvedValue({ id: "existing" });

			await expect(service.create({ ...dto })).rejects.toBeInstanceOf(
				ConflictException,
			);
			expect(repo.create).not.toHaveBeenCalled();
			expect(repo.save).not.toHaveBeenCalled();
		});

		it("hashes the password and persists departmentId/isActive", async () => {
			repo.findOne.mockResolvedValue(null);
			repo.create.mockImplementation((data: Partial<User>) => data);
			repo.save.mockImplementation(async (data: Partial<User>) => ({
				id: "new-id",
				...data,
			}));

			const created = await service.create({ ...dto });

			expect(repo.create).toHaveBeenCalledTimes(1);
			const payload = repo.create.mock.calls[0][0] as Partial<User>;
			expect(payload.email).toBe(dto.email);
			expect(payload.departmentId).toBe(2);
			expect(payload.isActive).toBe(true);
			expect(payload.password).not.toBe(dto.password);
			expect(payload.password).toMatch(/^\$2[aby]\$/); // bcrypt hash
			expect(created.id).toBe("new-id");
		});
	});

	describe("findAll", () => {
		it("paginates active users", async () => {
			repo.find.mockResolvedValue([{ id: "u1" }]);
			repo.count.mockResolvedValue(11);

			const result = await service.findAll({ page: 2, limit: 5 });

			expect(repo.find).toHaveBeenCalledWith(
				expect.objectContaining({
					order: { createdAt: "DESC" },
					relations: { department: true },
					where: { isActive: true },
					skip: 5,
					take: 5,
				}),
			);
			expect(repo.find.mock.calls[0][0].select).toEqual(
				expect.objectContaining({
					id: true,
					fullName: true,
					email: true,
					role: true,
					createdAt: true,
				}),
			);
			expect(repo.count).toHaveBeenCalledWith({ where: { isActive: true } });
			expect(result.pagination).toEqual({
				totalItems: 11,
				itemCount: 1,
				itemsPerPage: 5,
				totalPages: 3,
				currentPage: 2,
			});
		});

		it("defaults to the first page of 25", async () => {
			repo.find.mockResolvedValue([]);
			repo.count.mockResolvedValue(0);

			const result = await service.findAll({});

			expect(repo.find).toHaveBeenCalledWith(
				expect.objectContaining({ skip: 0, take: 25 }),
			);
			expect(result.pagination.currentPage).toBe(1);
		});
	});

	describe("findOne", () => {
		it("returns the user", async () => {
			repo.findOne.mockResolvedValue({ id: "u1" });

			await expect(service.findOne("u1")).resolves.toEqual({ id: "u1" });
		});

		it("throws NotFoundException when missing", async () => {
			repo.findOne.mockResolvedValue(null);

			await expect(service.findOne("missing")).rejects.toBeInstanceOf(
				NotFoundException,
			);
		});
	});

	describe("update", () => {
		it("merges the payload and saves", async () => {
			repo.findOne.mockResolvedValue({ id: "u1", fullName: "Old name" });
			repo.save.mockImplementation(async (value: unknown) => value);

			const result = await service.update("u1", { fullName: "New name" });

			expect(result.fullName).toBe("New name");
			expect(repo.save).toHaveBeenCalledWith(
				expect.objectContaining({ id: "u1", fullName: "New name" }),
			);
		});
	});

	describe("remove", () => {
		it("removes an existing user", async () => {
			const user = { id: "u1" };
			repo.findOne.mockResolvedValue(user);
			repo.remove.mockResolvedValue(user);

			await service.remove("u1");

			expect(repo.remove).toHaveBeenCalledWith(user);
		});

		it("throws NotFoundException when missing", async () => {
			repo.findOne.mockResolvedValue(null);

			await expect(service.remove("missing")).rejects.toBeInstanceOf(
				NotFoundException,
			);
		});
	});
});
