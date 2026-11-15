import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

// sample usage:
// @Roles('superadmin', 'manager')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Get('dashboard')
// getDashboard() {}

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
