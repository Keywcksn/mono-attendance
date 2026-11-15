import { IsIn, IsOptional, IsString, Matches } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination.dto";
import { OmitType } from "@nestjs/mapped-types";

export const ATTENDANCE_STATUSES = [
	"present",
	"absent",
	"late",
	"on_leave",
	"overtime",
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class AttendanceQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	userId?: string;

	@IsOptional()
	@IsIn(ATTENDANCE_STATUSES)
	status?: AttendanceStatus;

	@IsOptional()
	@Matches(DATE_RE, { message: "from must be YYYY-MM-DD" })
	from?: string;

	@IsOptional()
	@Matches(DATE_RE, { message: "to must be YYYY-MM-DD" })
	to?: string;
}

export class MyAttendanceQueryDto extends OmitType(AttendanceQueryDto, [
	"userId",
] as const) {}
