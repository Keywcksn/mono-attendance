import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { Department } from "../../departments/entities/department.entity";

@Index(["email"], { unique: true })
@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", length: 255, nullable: false, unique: true })
	email!: string;

	@Column({
		type: "varchar",
		length: 255,
		nullable: true,
		select: false, // exclude by default
	})
	password?: string;

	@Column({ type: "varchar", name: "full_name", length: 255, default: "-" })
	fullName!: string;

	@Column({
		type: "enum",
		enum: ["EMPLOYEE", "ADMIN"],
		name: "role",
		default: "EMPLOYEE",
	})
	role!: string;

	@Column({
		type: "enum",
		enum: ["MALE", "FEMALE"],
		name: "gender",
		default: "MALE",
	})
	gender!: string;

	@Column({
		type: "varchar",
		length: 25,
		name: "phone",
		nullable: true,
	})
	phone?: string;

	@Column({ type: "int", nullable: false, name: "department_id" })
	departmentId!: number;

	@ManyToOne(() => Department, { nullable: false })
	@JoinColumn({ name: "department_id" })
	department!: Department;

	@Column({ name: "is_active", type: "boolean", default: false })
	isActive!: boolean;

	@Column({
		name: "metadata",
		type: "jsonb",
		nullable: true,
	})
	metadata?: Record<string, any>;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;
}
