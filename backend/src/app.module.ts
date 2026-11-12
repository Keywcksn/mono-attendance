import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { UsersModule } from "./modules/users/users.module.js";
import { DepartmentsModule } from './modules/departments/departments.module.js';
import { AttendancesModule } from './modules/attendances/attendances.module';

@Module({
	imports: [AuthModule, UsersModule, DepartmentsModule, AttendancesModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
