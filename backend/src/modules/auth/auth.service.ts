import {
	Injectable,
	UnauthorizedException,
	Inject,
	ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import type { RedisClientType } from "redis";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import type { JwtPayload } from "./auth.types";

const REFRESH_TTL = 7 * 24 * 60 * 60; // 604800, 7 days in seconds

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		@Inject("REDIS_CLIENT") private readonly redis: RedisClientType,
	) {}

	async login(dto: LoginDto): Promise<{
		accessToken: string;
		refreshToken: string;
		user: {
			id: string;
			fullName: string;
			role: string;
		};
	}> {
		// 1. Find user with password hash
		const user = await this.usersService.findByEmail(dto.email);
		if (!user) {
			throw new UnauthorizedException({
				message: "Invalid email or password",
			});
		}

		// Check if the user's email is active (isActive)
		if (!user.isActive) {
			throw new ForbiddenException({
				message:
					"Email is deactivated. Please ask your administrator to activate your email.",
				errorCode: "ACCOUNT_DEACTIVATED",
			});
		}

		// 2. Verify password (synced external customers have no password — NULL → reject)
		const passwordValid =
			user.password != null &&
			(await bcrypt.compare(dto.password, user.password));
		if (!passwordValid) {
			throw new UnauthorizedException({
				message: "Invalid email or password",
				errorCode: "INVALID_CREDENTIALS",
			});
		}

		// 3. Sign access token
		const accessToken = this.signAccessToken(user);

		// 4. Generate + store refresh token
		const refreshToken = await this.issueRefreshToken(user.id);

		return {
			accessToken,
			refreshToken,
			user: {
				id: user.id,
				fullName: user.fullName,
				role: user.role,
			},
		};
	}

	async refresh(oldRefreshToken: string | undefined): Promise<{
		accessToken: string;
		refreshToken: string;
	}> {
		if (!oldRefreshToken) {
			throw new UnauthorizedException("No refresh token provided");
		}

		const tokenHash = this.hashToken(oldRefreshToken);

		// find the matching Redis key.
		const keys = await this.redis.keys(`refresh:*:${tokenHash}`);

		if (keys.length === 0) {
			throw new UnauthorizedException("Invalid or already-used refresh token");
		}

		// Use the first match (there should only be one)
		const key = keys[0];
		const userId = await this.redis.get(key);

		// Delete old token BEFORE issuing new one (rotation)
		await this.redis.del(key);

		if (!userId) {
			throw new UnauthorizedException("Session expired");
		}

		// Verify the user still exists
		const user = await this.usersService.findOne(userId);
		if (!user) {
			throw new UnauthorizedException("User no longer exists");
		}

		// Issue new pair
		const accessToken = this.signAccessToken(user);
		const refreshToken = await this.issueRefreshToken(user.id);

		return { accessToken, refreshToken };
	}

	// ── Logout ─────────────────────────────────────────────
	async logout(refreshToken: string | undefined): Promise<void> {
		if (!refreshToken) return;

		const tokenHash = this.hashToken(refreshToken);
		const keys = await this.redis.keys(`refresh:*:${tokenHash}`);

		if (keys.length === 0) return;

		const userId = (await this.redis.get(keys[0])) ?? keys[0].split(":")[1];

		await this.redis.del(keys[0]);
	}

	private signAccessToken(
		user: Awaited<ReturnType<UsersService["findByEmail"]>>,
	): string {
		if (!user) throw new UnauthorizedException();

		const payload: Omit<JwtPayload, "iat" | "exp"> = {
			sub: user.id,
			email: user.email,
			role: user.role,
		};

		return this.jwtService.sign(payload);
	}

	// generate an opaque refresh token, hash it, store in Redis.
	private async issueRefreshToken(userId: string): Promise<string> {
		const raw = crypto.randomBytes(32).toString("hex");
		const hash = this.hashToken(raw);

		await this.redis.set(`refresh:${userId}:${hash}`, userId, {
			EX: REFRESH_TTL,
		});

		return raw; // return the RAW token to the caller (goes in cookie)
	}

	/** SHA-256 hash a raw refresh token for storage in Redis. */
	private hashToken(raw: string): string {
		return crypto.createHash("sha256").update(raw).digest("hex");
	}
}
