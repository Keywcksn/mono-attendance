import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { JwtPayload } from "../auth.types";

// validates the JWT signature and expiration, and attaches the payload to the request object
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET as string,
		});
	}

	async validate(payload: JwtPayload): Promise<JwtPayload> {
		// stateless — the signature is the only verification.
		// attach the full payload so guards and controllers can use it
		return payload;
	}
}
