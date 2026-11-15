import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Attendance } from "./entities/attendance.entity";
import { AttendanceService } from "./attendances.service";
import { AttendancesController } from "./attendances.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Attendance])],
	controllers: [AttendancesController],
	providers: [AttendanceService],
})
export class AttendancesModule {}
