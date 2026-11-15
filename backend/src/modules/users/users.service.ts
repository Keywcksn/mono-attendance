import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const existing = await this.userRepository.findOne({
			where: { email: createUserDto.email },
		});

		if (existing) {
			throw new ConflictException("User with this email already exists");
		}

		const hashedPassword = bcrypt.hashSync(createUserDto.password, SALT_ROUNDS);

		const user = this.userRepository.create({
			...createUserDto,
			password: hashedPassword,
		});

		const saved = await this.userRepository.save(user);
		return saved;
	}

	async findAll(query: PaginationQueryDto): Promise<PaginatedResult<User>> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 25;
		const skip = (page - 1) * limit;

		const [data, totalItems] = await Promise.all([
			this.userRepository.find({
				order: { createdAt: "DESC" },
				relations: { department: true },
				where: { isActive: true },
				select: {
					id: true,
					fullName: true,
					email: true,
					role: true,
					createdAt: true,
					department: { id: true, name: true },
				},
				skip,
				take: limit,
			}),
			this.userRepository.count({ where: { isActive: true } }),
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

	async findOne(id: string): Promise<User> {
		const user = await this.userRepository.findOne({
			relations: { department: true },
			where: { id },
			select: {
				id: true,
				fullName: true,
				email: true,
				role: true,
				gender: true,
				phone: true,
				createdAt: true,
				department: { id: true, name: true },
			},
		});
		if (!user) {
			throw new NotFoundException("User not found");
		}
		return user;
	}

	async findByEmail(email: string): Promise<User> {
		// `password` is `select: false` on the entity, so add it back explicitly
		// (login needs it to verify credentials).
		const user = await this.userRepository
			.createQueryBuilder("user")
			.addSelect("user.password")
			.where("user.email = :email", { email })
			.getOne();
		if (!user) {
			throw new NotFoundException("User not found");
		}
		return user;
	}

	async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
		const user = await this.findOne(id);
		Object.assign(user, updateUserDto);
		return this.userRepository.save(user);
	}

	async remove(id: string): Promise<void> {
		const user = await this.findOne(id);
		await this.userRepository.remove(user);
	}
}
