import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Use in combination with RolesGuard for role-based access:
// @UseGuards(JwtAuthGuard, RolesGuard)

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
