import {
	Controller,
	Post,
	Body,
	UseGuards,
	Res,
	HttpCode,
	HttpStatus,
	Req,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ApiKeyGuard } from "./guards/api-key.guard";

// 7 days in ms, matches Redis TTL
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// cookie options for the refresh token
const REFRESH_COOKIE_OPTIONS = {
	httpOnly: true,
	// secure: process.env.NODE_ENV === "production",
	secure: true,
	sameSite: "none" as const, // change to strict later
	path: "/auth/refresh",
	maxAge: COOKIE_MAX_AGE,
};

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(ApiKeyGuard)
	@Post("login")
	@HttpCode(HttpStatus.OK)
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { accessToken, refreshToken, user } =
			await this.authService.login(dto);

		res.cookie("refresh_token", refreshToken, REFRESH_COOKIE_OPTIONS);

		return {
			id: user.id,
			fullName: user.fullName,
			role: user.role,
			accessToken: accessToken,
			accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
		};
	}

	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const oldRefreshToken = req.cookies?.refresh_token as string | undefined;

		const { accessToken, refreshToken } =
			await this.authService.refresh(oldRefreshToken);

		res.cookie("refresh_token", refreshToken, REFRESH_COOKIE_OPTIONS);

		return {
			accessToken: accessToken,
			accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
		};
	}

	@Post("logout")
	@HttpCode(HttpStatus.NO_CONTENT)
	async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = req.cookies?.refresh_token as string | undefined;

		await this.authService.logout(refreshToken);

		res.clearCookie("refresh_token", { path: "/auth/refresh" });
	}
}
