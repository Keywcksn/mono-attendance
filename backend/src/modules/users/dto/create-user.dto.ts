import {
	IsString,
	IsEmail,
	IsNotEmpty,
	IsIn,
	MaxLength,
	IsInt,
	Min,
	IsBoolean,
	IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	fullName!: string;

	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@IsString()
	@IsNotEmpty()
	password!: string;

	@IsString()
	@MaxLength(50)
	@IsIn(["ADMIN", "EMPLOYEE"])
	role!: string;

	@IsString()
	@MaxLength(8)
	@IsIn(["MALE", "FEMALE"])
	gender!: string;

	@IsOptional()
	@IsString()
	@MaxLength(25)
	phone?: string;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	departmentId!: number;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
