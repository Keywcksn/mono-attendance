import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "../modules/users/entities/user.entity";
import { Department } from "../modules/departments/entities/department.entity";
import { Attendance } from "../modules/attendances/entities/attendance.entity";

// Load environment variables from .env for CLI execution
config();

export const ENTITIES = [User, Department, Attendance] as const;

export const dataSourceOptions: DataSourceOptions = {
	type: "postgres",
	host: process.env.DB_HOST || "localhost",
	port: parseInt(process.env.DB_PORT || "5432", 10),
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	entities: [...ENTITIES],
	migrations: ["dist/database/migrations/*.js"],
	synchronize: true, // Set to false in production
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
