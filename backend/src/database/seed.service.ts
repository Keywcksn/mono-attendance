import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";
import { Department } from '../modules/departments/entities/department.entity';
import { User } from '../modules/users/entities/user.entity';
import { initialDepartments } from '../database/seeders/data/departments.seed';
import { initialUsers } from '../database/seeders/data/users.seed';
const SALT_ROUNDS = 10;

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async run() {
    this.logger.log('🌱 Starting database seeding...');

    // 1. Seed Departments
    const departmentMap = new Map<string, Department>();
    
    for (const deptData of initialDepartments) {
      let department = await this.departmentRepository.findOne({
        where: { name: deptData.name },
      });

      if (!department) {
        department = this.departmentRepository.create(deptData);
        await this.departmentRepository.save(department);
        this.logger.log(`✓ Created department: ${deptData.name}`);
      } else {
        this.logger.log(`- Department already exists: ${deptData.name}`);
      }
      departmentMap.set(deptData.name, department);
    }

    // 2. Seed Users
    for (const userData of initialUsers) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const { department_name, password, is_active, ...rest } = userData;
        const department = departmentMap.get(department_name);
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        if (!department) throw new Error(`Department not found: "${department_name}"`);

        const user = this.userRepository.create({
          ...rest,
          password: hashedPassword,
          departmentId: department.id,
          isActive: is_active,
        });

        await this.userRepository.save(user);
        this.logger.log(`✓ Created user: ${userData.email} (${userData.role})`);
      } else {
        this.logger.log(`- User already exists: ${userData.email}`);
      }
    }

    this.logger.log('✨ Database seeding completed successfully.');
  }
}