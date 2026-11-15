import { Logger, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { createClient, type RedisClientType } from "redis";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jtw.strategy";
import { UsersModule } from "../users/users.module";

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.registerAsync({
			useFactory: () => ({
				secret: process.env.JWT_SECRET,
				signOptions: {
					expiresIn: parseInt(process.env.JWT_ACCESS_TTL || "900", 10),
				},
			}),
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
		{
			provide: "REDIS_CLIENT",
			useFactory: async (): Promise<RedisClientType> => {
				const client = createClient({
					socket: {
						host: process.env.REDIS_HOST ?? "localhost",
						port: Number(process.env.REDIS_PORT ?? 6379),
					},
					password: process.env.REDIS_PASSWORD || undefined,
				});

				client.on("error", (error) =>
					Logger.error(error, undefined, "RedisClient"),
				);

				await client.connect();
				return client;
			},
		},
	],
})
export class AuthModule {}
