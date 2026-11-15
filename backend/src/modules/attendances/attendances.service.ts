import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
	FindOptionsWhere,
	LessThanOrEqual,
	MoreThanOrEqual,
	Repository,
	Between,
} from "typeorm";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Attendance } from "./entities/attendance.entity";
import {
	AttendanceQueryDto,
	MyAttendanceQueryDto,
} from "./dto/attendance-query.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";

const TZ = "Asia/Jakarta";
const WORK_START = "08:00"; // check-in after this (HH:mm) => "late"
const UPLOAD_ROOT = join(process.cwd(), "uploads");
const PHOTO_DIR = "attendance";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MIME_EXT: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

// "YYYY-MM-DD" in the business timezone (not server/UTC)
const dateInTz = (d: Date) =>
	new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);

// "HH:mm" in the business timezone
const timeInTz = (d: Date) =>
	d.toLocaleTimeString("en-GB", {
		timeZone: TZ,
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
	});

@Injectable()
export class AttendanceService {
	constructor(
		@InjectRepository(Attendance)
		private readonly attendanceRepository: Repository<Attendance>,
	) {}

	async checkIn(
		userId: string,
		photo: Express.Multer.File,
	): Promise<Attendance> {
		const now = new Date();
		const date = dateInTz(now);

		const existing = await this.attendanceRepository.findOne({
			where: { userId, date },
		});
		if (existing) throw new ConflictException("Already checked in today");

		const photoPath = await this.savePhoto(photo, date, "in");
		try {
			return await this.attendanceRepository.save(
				this.attendanceRepository.create({
					userId,
					date,
					checkInTime: now.toISOString(),
					status: timeInTz(now) > WORK_START ? "late" : "present",
					checkInPhoto: photoPath,
				}),
			);
		} catch (err) {
			await this.deletePhoto(photoPath);
			throw err;
		}
	}

	async checkOut(
		userId: string,
		photo: Express.Multer.File,
	): Promise<Attendance> {
		const now = new Date();
		const date = dateInTz(now);

		const record = await this.attendanceRepository.findOne({
			where: { userId, date },
		});
		if (!record?.checkInTime)
			throw new BadRequestException("You haven't checked in today");
		if (record.checkOutTime)
			throw new ConflictException("Already checked out today");

		const photoPath = await this.savePhoto(photo, date, "out");
		try {
			record.checkOutTime = now.toISOString();
			record.checkOutPhoto = photoPath;
			record.duration = Math.round(
				(now.getTime() - new Date(record.checkInTime).getTime()) / 60_000,
			); // minutes
			return await this.attendanceRepository.save(record);
		} catch (err) {
			await this.deletePhoto(photoPath);
			throw err;
		}
	}

	async findAll(
		query: AttendanceQueryDto,
	): Promise<PaginatedResult<Attendance>> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 25;

		const qb = this.attendanceRepository
			.createQueryBuilder("a")
			.leftJoin("a.user", "u")
			.leftJoin("u.department", "d")
			.addSelect(["u.id", "u.fullName", "d.id", "d.name"])
			.orderBy("a.date", "DESC")
			.addOrderBy("a.id", "DESC")
			.skip((page - 1) * limit)
			.take(limit);

		if (query.userId)
			qb.andWhere("a.userId = :userId", { userId: query.userId });
		if (query.status)
			qb.andWhere("a.status = :status", { status: query.status });
		if (query.from) qb.andWhere("a.date >= :from", { from: query.from });
		if (query.to) qb.andWhere("a.date <= :to", { to: query.to });

		const [items, totalItems] = await qb.getManyAndCount();

		return {
			items,
			pagination: {
				totalItems,
				itemCount: items.length,
				itemsPerPage: limit,
				totalPages: Math.ceil(totalItems / limit),
				currentPage: page,
			},
		};
	}

	async summarize(
		userId: string,
		role: string,
	): Promise<Record<string, number>> {
		const { from, to } = this.getRange(role);

		const qb = this.attendanceRepository
			.createQueryBuilder("a")
			.select("a.status", "status")
			.addSelect("COUNT(*)", "count")
			.where("a.date BETWEEN :from AND :to", { from, to })
			.groupBy("a.status");

		if (role === "ADMIN") {
			qb.innerJoin("a.user", "u").andWhere("u.role = :role", {
				role: "EMPLOYEE",
			});
		} else {
			qb.andWhere("a.userId = :userId", { userId });
		}

		const rows = await qb.getRawMany<{
			status: string | null;
			count: string;
		}>();

		const result: Record<string, number> = {
			present: 0,
			absent: 0,
			late: 0,
			on_leave: 0,
			overtime: 0,
		};

		for (const r of rows) {
			if (r.status) result[r.status] = Number(r.count);
		}

		return result;
	}

	private getRange(role: string): { from: string; to: string } {
		// YYYY-MM-DD in user timezone
		const today = new Date().toLocaleDateString("en-CA", {
			timeZone: "Asia/Jakarta",
		});
		if (role === "ADMIN") return { from: today, to: today };

		const [y, m] = today.split("-").map(Number);
		const lastDay = new Date(y, m, 0).getDate(); // day 0 of next month = last day of this month
		const mm = String(m).padStart(2, "0");
		return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${lastDay}` };
	}

	async findMine(
		query: MyAttendanceQueryDto,
		userId: string,
	): Promise<PaginatedResult<Attendance>> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 25;

		const qb = this.attendanceRepository
			.createQueryBuilder("a")
			.leftJoin("a.user", "u")
			.leftJoin("u.department", "d")
			.addSelect(["u.id", "u.fullName", "d.id", "d.name"])
			.where("a.userId = :userId", { userId })
			.orderBy("a.date", "DESC")
			.addOrderBy("a.id", "DESC")
			.skip((page - 1) * limit)
			.take(limit);

		if (query.status)
			qb.andWhere("a.status = :status", { status: query.status });
		if (query.from) qb.andWhere("a.date >= :from", { from: query.from });
		if (query.to) qb.andWhere("a.date <= :to", { to: query.to });

		const [items, totalItems] = await qb.getManyAndCount();

		return {
			items,
			pagination: {
				totalItems,
				itemCount: items.length,
				itemsPerPage: limit,
				totalPages: Math.ceil(totalItems / limit),
				currentPage: page,
			},
		};
	}

	async findOne(id: number): Promise<Attendance> {
		const record = await this.attendanceRepository
			.createQueryBuilder("a")
			.leftJoin("a.user", "u")
			.leftJoin("u.department", "d")
			.addSelect(["u.id", "u.fullName", "d.id", "d.name"])
			.where("a.id = :id", { id })
			.getOne();

		if (!record) {
			throw new NotFoundException(`Attendance ${id} not found`);
		}
		return record;
	}

	async delete(id: number): Promise<void> {
		const record = await this.attendanceRepository.findOne({
			where: { id },
		});
		if (!record) {
			throw new NotFoundException(`Attendance ${id} not found`);
		}
		await this.attendanceRepository.remove(record);
	}

	// ---- photo helpers ----

	private async savePhoto(
		file: Express.Multer.File | undefined,
		date: string,
		kind: "in" | "out",
	): Promise<string> {
		if (!file) throw new BadRequestException("photo is required");
		const ext = MIME_EXT[file.mimetype];
		if (!ext) throw new BadRequestException("photo must be JPEG, PNG or WebP");
		if (file.size > MAX_PHOTO_BYTES)
			throw new BadRequestException("photo exceeds 5MB");

		// Never use file.originalname: random name + whitelisted extension only
		const relPath = join(PHOTO_DIR, `${date}-${kind}-${randomUUID()}.${ext}`);
		await mkdir(join(UPLOAD_ROOT, PHOTO_DIR), { recursive: true });
		await writeFile(join(UPLOAD_ROOT, relPath), file.buffer);
		return relPath.replace(/\\/g, "/");
	}

	private async deletePhoto(relPath: string): Promise<void> {
		await unlink(join(UPLOAD_ROOT, relPath)).catch(() => undefined);
	}
}
