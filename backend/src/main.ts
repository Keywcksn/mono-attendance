import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "node:path";
import { AppModule } from "./app.module";
import { ResponseInterceptor } from "./common/interceptor/response.interceptor";
import { AllExceptionsFilter } from "./common/filters/exceptions.filter";
import cookieParser from "cookie-parser";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(cookieParser());

	// Attendance photos are stored under backend/uploads and served read-only
	(app as unknown as NestExpressApplication).useStaticAssets(
		join(process.cwd(), "uploads"),
		{ prefix: "/uploads/" },
	);

	// Validate request bodies/queries by their DTO types and strip unknown
	// properties; `transform` applies the @Type() conversions on the DTOs.
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		}),
	);

	// wrap failed response
	app.useGlobalFilters(new AllExceptionsFilter());

	// wrap every successful response in { status: "SUCCESS", data: <result> }
	app.useGlobalInterceptors(new ResponseInterceptor());

	app.setGlobalPrefix("api");
	await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
	console.error("Failed to start application:", error);
	process.exit(1);
});
