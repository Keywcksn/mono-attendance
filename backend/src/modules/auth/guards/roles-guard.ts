import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { JwtPayload } from "../auth.types";

// role-based access using @Roles() decorator and RolesGuard
@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);

		// No @Roles() metadata → route is public (in terms of roles)
		if (!requiredRoles || requiredRoles.length === 0) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

		if (!user) {
			throw new ForbiddenException("Not authenticated");
		}

		if (!requiredRoles.includes(user.role)) {
			throw new ForbiddenException(`Role "${user.role}" does not have access.`);
		}

		return true;
	}
}
