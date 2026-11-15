import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
} from "@nestjs/common";

// generate a random API key using crypto
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
@Injectable()
export class ApiKeyGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context
			.switchToHttp()
			.getRequest<Request & { headers: Record<string, string | undefined> }>();
		const apiKey = request.headers["x-api-key"];

		if (!apiKey) {
			throw new UnauthorizedException("Missing x-api-key header");
		}

		const configuredKey = process.env.API_KEY;

		if (!configuredKey) {
			throw new UnauthorizedException(
				"API key is not configured on the server",
			);
		}

		if (apiKey !== configuredKey) {
			throw new UnauthorizedException("Invalid API key");
		}

		return true;
	}
}
