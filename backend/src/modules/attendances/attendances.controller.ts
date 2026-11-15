import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	UseInterceptors,
	UploadedFile,
	Req,
	Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { AttendanceService } from "./attendances.service";
import {
	AttendanceQueryDto,
	MyAttendanceQueryDto,
} from "./dto/attendance-query.dto";
import { RolesGuard } from "../auth/guards/roles-guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import type { JwtPayload } from "../auth/auth.types";

@Controller("attendances")
export class AttendancesController {
	constructor(private readonly attendanceService: AttendanceService) {}

	@Post("check-in")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN", "EMPLOYEE")
	@UseInterceptors(
		FileInterceptor("photo", {
			storage: memoryStorage(),
			limits: { fileSize: 5 * 1024 * 1024 },
		}),
	)
	checkIn(
		@Req() req: { user: JwtPayload },
		@UploadedFile() photo: Express.Multer.File,
	) {
		return this.attendanceService.checkIn(String(req.user.sub), photo);
	}

	@Post("check-out")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN", "EMPLOYEE")
	@UseInterceptors(
		FileInterceptor("photo", {
			storage: memoryStorage(),
			limits: { fileSize: 5 * 1024 * 1024 },
		}),
	)
	checkOut(
		@Req() req: { user: JwtPayload },
		@UploadedFile() photo: Express.Multer.File,
	) {
		return this.attendanceService.checkOut(String(req.user.sub), photo);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	findAll(@Query() query: AttendanceQueryDto) {
		return this.attendanceService.findAll(query);
	}

	@Get("summary")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN", "EMPLOYEE")
	summary(@Req() req: { user: JwtPayload }) {
		return this.attendanceService.summarize(req.user.sub, req.user.role);
	}

	@Get("mine")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("EMPLOYEE")
	findMine(
		@Query() query: MyAttendanceQueryDto,
		@Req() req: { user: JwtPayload },
	) {
		return this.attendanceService.findMine(query, req.user.sub);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN", "EMPLOYEE")
	findOne(@Param("id") id: string) {
		return this.attendanceService.findOne(+id);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	remove(@Param("id") id: string) {
		return this.attendanceService.delete(+id);
	}
}
