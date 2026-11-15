import { NestFactory } from "@nestjs/core";
import { SeedModule } from "./seed.module";
import { SeedService } from "./seed.service";

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(SeedModule);

	try {
		await app.get(SeedService).run();
	} finally {
		await app.close();
	}
}

bootstrap().catch((error) => {
	console.error("Seeding failed:", error);
	process.exitCode = 1;
});
