import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
	ConflictException,
} from "@nestjs/common";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Department } from "./entities/department.entity";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";
import { User } from "../users/entities/user.entity";

const PREVIEW_SIZE = 5;
type DepartmentListItem = {
	id: number;
	name: string;
	description?: string;
	employeeCount: number;
	employees: { id: string; fullName: string }[];
};

@Injectable()
export class DepartmentsService {
	constructor(
		@InjectRepository(Department)
		private readonly departmentRepository: Repository<Department>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
		const existing = await this.departmentRepository.findOne({
			where: { name: createDepartmentDto.name },
		});
		if (existing) {
			throw new ConflictException("Department with this name already exists");
		}
		const department = this.departmentRepository.create(createDepartmentDto);
		return this.departmentRepository.save(department);
	}

	async findAll(
		query: PaginationQueryDto,
	): Promise<PaginatedResult<Department>> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 25;
		const skip = (page - 1) * limit;

		const [data, totalItems] = await Promise.all([
			this.departmentRepository.find({
				order: { createdAt: "DESC" },
				select: {
					id: true,
					name: true,
					description: true,
				},
				skip,
				take: limit,
			}),
			this.departmentRepository.count(),
		]);

		return {
			items: data,
			pagination: {
				totalItems,
				itemCount: data.length,
				itemsPerPage: limit,
				totalPages: Math.ceil(totalItems / limit),
				currentPage: page,
			},
		};
	}

	async findOne(id: number) {
		const department = await this.departmentRepository.findOne({
			where: { id },
		});
		if (!department) {
			throw new NotFoundException("Department not found");
		}
		return department;
	}

	update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
		return `This action updates a #${id} department`;
	}

	remove(id: number) {
		return `This action removes a #${id} department`;
	}

	async findWithEmployees(
		query: PaginationQueryDto,
	): Promise<PaginatedResult<DepartmentListItem>> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 25;
		const skip = (page - 1) * limit;

		const [departments, totalItems] = await Promise.all([
			this.departmentRepository.find({
				order: { createdAt: "DESC" },
				select: { id: true, name: true, description: true },
				skip,
				take: limit,
			}),
			this.departmentRepository.count(),
		]);

		const ids = departments.map((d) => d.id);
		const counts = new Map<number, number>();
		const previews = new Map<number, { id: string; fullName: string }[]>();

		if (ids.length > 0) {
			// 1) total people per department
			const countQb = this.userRepository
				.createQueryBuilder("u")
				.select("d.id", "departmentId")
				.addSelect("COUNT(*)", "count")
				.innerJoin("u.department", "d")
				.where("d.id IN (:...ids)", { ids })
				.groupBy("d.id");

			// 2) first N people per department (window function)
			const ranked = this.userRepository
				.createQueryBuilder("u")
				.select("u.id", "id")
				.addSelect("u.fullName", "fullName")
				.addSelect("d.id", "departmentId")
				.addSelect(
					"ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY u.fullName)",
					"rn",
				)
				.innerJoin("u.department", "d")
				.where("d.id IN (:...ids)", { ids });

			const previewQb = this.userRepository.manager
				.createQueryBuilder()
				.select("r.*")
				.from(`(${ranked.getQuery()})`, "r")
				.where("r.rn <= :n", { n: PREVIEW_SIZE })
				.setParameters(ranked.getParameters());

			const [countRows, previewRows] = await Promise.all([
				countQb.getRawMany<{ departmentId: number; count: string }>(),
				previewQb.getRawMany<{
					id: string;
					fullName: string;
					departmentId: number;
				}>(),
			]);

			for (const r of countRows)
				counts.set(Number(r.departmentId), Number(r.count));
			for (const r of previewRows) {
				const key = Number(r.departmentId);
				const list = previews.get(key) ?? [];
				list.push({ id: r.id, fullName: r.fullName });
				previews.set(key, list);
			}
		}

		const items: DepartmentListItem[] = departments.map((d) => ({
			id: d.id,
			name: d.name,
			description: d.description,
			employeeCount: counts.get(d.id) ?? 0,
			employees: previews.get(d.id) ?? [],
		}));

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
}
