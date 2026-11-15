import { Test, type TestingModule } from "@nestjs/testing";
import { UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

// Replace bcrypt with fakes; the real module is never used in these tests.
vi.mock("bcrypt", () => ({ compare: vi.fn() }));

// @types/bcrypt declares a callback overload returning void *last*, so
// vi.mocked(bcrypt.compare) infers void. Pin the promise overload instead.
const compareMock = bcrypt.compare as unknown as Mock<
	(data: string | Buffer, encrypted: string) => Promise<boolean>
>;

const sha256 = (raw: string) =>
	crypto.createHash("sha256").update(raw).digest("hex");

describe("AuthService", () => {
	let service: AuthService;

	// Fake dependencies: only the methods AuthService actually uses
	const usersService = { findByEmail: vi.fn(), findOne: vi.fn() };
	const jwtService = { sign: vi.fn() };
	const redis = {
		keys: vi.fn(),
		get: vi.fn(),
		set: vi.fn(),
		del: vi.fn(),
	};

	const mockUser = {
		id: "user-1",
		email: "kela@example.com",
		fullName: "Kela",
		role: "admin",
		isActive: true,
		password: "hashed-password",
	};

	beforeEach(async () => {
		vi.resetAllMocks(); // clean slate so tests don't affect each other
		jwtService.sign.mockReturnValue("access-token");

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: UsersService, useValue: usersService },
				{ provide: JwtService, useValue: jwtService },
				{ provide: "REDIS_CLIENT", useValue: redis }, // same token as @Inject("REDIS_CLIENT")
			],
		}).compile();

		service = module.get(AuthService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	// ───────────────────────── login ─────────────────────────
	describe("login", () => {
		const dto = { email: mockUser.email, password: "secret" };

		it("throws Unauthorized if user not found", async () => {
			usersService.findByEmail.mockResolvedValue(null);

			await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
		});

		it("throws Forbidden if user is deactivated", async () => {
			usersService.findByEmail.mockResolvedValue({
				...mockUser,
				isActive: false,
			});

			await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
		});

		it("throws Unauthorized if user has no password (synced customer)", async () => {
			usersService.findByEmail.mockResolvedValue({
				...mockUser,
				password: null,
			});

			await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
			expect(compareMock).not.toHaveBeenCalled();
		});

		it("throws Unauthorized if password is wrong", async () => {
			usersService.findByEmail.mockResolvedValue(mockUser);
			vi.mocked(compareMock).mockResolvedValue(false);

			await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
		});

		it("returns tokens + user and stores the hashed refresh token", async () => {
			usersService.findByEmail.mockResolvedValue(mockUser);
			vi.mocked(compareMock).mockResolvedValue(true);

			const result = await service.login(dto);

			expect(result.accessToken).toBe("access-token");
			expect(result.user).toEqual({
				id: "user-1",
				fullName: "Kela",
				role: "admin",
			});
			// Redis stores the HASH, never the raw token
			expect(redis.set).toHaveBeenCalledWith(
				`refresh:user-1:${sha256(result.refreshToken)}`,
				"user-1",
				{ EX: 604800 },
			);
		});
	});

	// ───────────────────────── refresh ─────────────────────────
	describe("refresh", () => {
		const oldToken = "old-raw-token";
		const key = `refresh:user-1:${sha256(oldToken)}`;

		it("throws if no token is provided", async () => {
			await expect(service.refresh(undefined)).rejects.toThrow(
				UnauthorizedException,
			);
		});

		it("throws if token not found in Redis", async () => {
			redis.keys.mockResolvedValue([]);

			await expect(service.refresh(oldToken)).rejects.toThrow(
				UnauthorizedException,
			);
		});

		it("throws if session expired (key exists but value is gone)", async () => {
			redis.keys.mockResolvedValue([key]);
			redis.get.mockResolvedValue(null);

			await expect(service.refresh(oldToken)).rejects.toThrow(
				"Session expired",
			);
		});

		it("throws if user no longer exists", async () => {
			redis.keys.mockResolvedValue([key]);
			redis.get.mockResolvedValue("user-1");
			usersService.findOne.mockResolvedValue(null);

			await expect(service.refresh(oldToken)).rejects.toThrow(
				"User no longer exists",
			);
		});

		it("rotates: deletes old token and issues a new pair", async () => {
			redis.keys.mockResolvedValue([key]);
			redis.get.mockResolvedValue("user-1");
			usersService.findOne.mockResolvedValue(mockUser);

			const result = await service.refresh(oldToken);

			expect(redis.keys).toHaveBeenCalledWith(`refresh:*:${sha256(oldToken)}`);
			expect(redis.del).toHaveBeenCalledWith(key);
			expect(result.accessToken).toBe("access-token");
			expect(result.refreshToken).not.toBe(oldToken);
			expect(redis.set).toHaveBeenCalledTimes(1);
		});
	});

	// ───────────────────────── logout ─────────────────────────
	describe("logout", () => {
		it("does nothing if no token", async () => {
			await service.logout(undefined);

			expect(redis.keys).not.toHaveBeenCalled();
		});

		it("does nothing if token not found", async () => {
			redis.keys.mockResolvedValue([]);

			await service.logout("some-token");

			expect(redis.del).not.toHaveBeenCalled();
		});

		it("deletes the token from Redis", async () => {
			const key = `refresh:user-1:${sha256("some-token")}`;
			redis.keys.mockResolvedValue([key]);
			redis.get.mockResolvedValue("user-1");

			await service.logout("some-token");

			expect(redis.del).toHaveBeenCalledWith(key);
		});
	});
});
