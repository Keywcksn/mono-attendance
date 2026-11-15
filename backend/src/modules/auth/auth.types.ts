// JWT payload
export interface JwtPayload {
	sub: string; // user uuid
	email: string;
	role: string;
	iat: number;
	exp: number;
}
