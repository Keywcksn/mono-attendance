import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from "typeorm";

@Index(["id"], { unique: true })
@Entity()
export class Department {
    @PrimaryGeneratedColumn()
	id!: number;

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    name!: string;

    @Column({
        type: "varchar",
        length: 255,
        nullable: true,
    })
    description?: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
