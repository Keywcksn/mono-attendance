import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "./database/data-source";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { DepartmentsModule } from "./modules/departments/departments.module";
import { AttendancesModule } from "./modules/attendances/attendances.module";

@Module({
	imports: [
		TypeOrmModule.forRoot(dataSourceOptions),
		AuthModule,
		UsersModule,
		DepartmentsModule,
		AttendancesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
