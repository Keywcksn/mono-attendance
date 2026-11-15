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
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { RolesGuard } from "../auth/guards/roles-guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import type { JwtPayload } from "../auth/auth.types";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN", "EMPLOYEE")
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	findAll(@Query() query: PaginationQueryDto) {
		return this.usersService.findAll(query);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN", "EMPLOYEE")
	findOne(@Param("id") id: string, @Req() req: { user: JwtPayload }) {
		const targetId = req.user.role === "EMPLOYEE" ? req.user.sub : id;
		return this.usersService.findOne(targetId);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN", "EMPLOYEE")
	update(
		@Param("id") id: string,
		@Body() updateUserDto: UpdateUserDto,
		@Req() req: { user: JwtPayload },
	) {
		const targetId = req.user.role === "EMPLOYEE" ? req.user.sub : id;
		return this.usersService.update(targetId, updateUserDto);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	remove(@Param("id") id: string) {
		return this.usersService.remove(id);
	}
}
