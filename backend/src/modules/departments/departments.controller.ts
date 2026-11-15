import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
	Req,
} from "@nestjs/common";
import { DepartmentsService } from "./departments.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { RolesGuard } from "../auth/guards/roles-guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";

@Controller("departments")
export class DepartmentsController {
	constructor(private readonly departmentsService: DepartmentsService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	create(@Body() createDepartmentDto: CreateDepartmentDto) {
		return this.departmentsService.create(createDepartmentDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	findAll(@Query() query: PaginationQueryDto) {
		return this.departmentsService.findAll(query);
	}

	@Get("full")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	findWithEmployees(@Query() query: PaginationQueryDto) {
		return this.departmentsService.findWithEmployees(query);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN", "EMPLOYEE")
	findOne(@Param("id") id: string) {
		return this.departmentsService.findOne(+id);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	update(
		@Param("id") id: string,
		@Body() updateDepartmentDto: UpdateDepartmentDto,
	) {
		return this.departmentsService.update(+id, updateDepartmentDto);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	remove(@Param("id") id: string) {
		return this.departmentsService.remove(+id);
	}
}
