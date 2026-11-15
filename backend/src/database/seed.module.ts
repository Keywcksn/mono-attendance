import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SeedService } from "./seed.service";
import { dataSourceOptions } from "./data-source";
import { User } from "../modules/users/entities/user.entity";
import { Department } from "../modules/departments/entities/department.entity";

@Module({
	imports: [
		TypeOrmModule.forRoot(dataSourceOptions),
		TypeOrmModule.forFeature([User, Department]),
	],
	providers: [SeedService],
})
export class SeedModule {}
