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
import { User } from "../../users/entities/user.entity";

@Index(["id"], { unique: true })
@Entity()
export class Attendance {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "varchar", nullable: false })
	userId!: string;

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: "userId" })
	user!: User;

	@Column({ type: "date", nullable: false })
	date!: string;

	@Column({ type: "timestamptz", nullable: true })
	checkInTime?: string;

	@Column({ type: "timestamptz", nullable: true })
	checkOutTime?: string;

	@Column({
		type: "enum",
		enum: ["present", "absent", "late", "on_leave", "overtime"],
		nullable: true,
		name: "status",
	})
	status?: string;

	@Column({ type: "integer", nullable: false, default: 0 })
	duration!: number;

	@Column({
		type: "varchar",
		length: 255,
		nullable: true,
		name: "check_in_photo",
	})
	checkInPhoto?: string;

	@Column({
		type: "varchar",
		length: 255,
		nullable: true,
		name: "check_out_photo",
	})
	checkOutPhoto?: string;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;
}
