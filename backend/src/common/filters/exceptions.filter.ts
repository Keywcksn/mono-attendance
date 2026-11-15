import {
	ArgumentsHost,
	Catch,
	HttpException,
	HttpStatus,
	Logger,
	type ExceptionFilter,
} from "@nestjs/common";
import type { Response } from "express";

export interface FailedResponse {
	status: "FAILED";
	data: {
		statusCode: number;
		message: string;
		errors?: string[];
	};
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const res = host.switchToHttp().getResponse<Response>();

		let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = "Internal server error";
		let errors: string[] | undefined;

		if (exception instanceof HttpException) {
			statusCode = exception.getStatus();
			const body = exception.getResponse();

			if (typeof body === "string") {
				message = body;
			} else {
				const b = body as { message?: string | string[]; error?: string };
				if (Array.isArray(b.message)) {
					// class-validator errors
					message = b.error ?? "Validation failed";
					errors = b.message;
				} else {
					message = b.message ?? exception.message;
				}
			}
		} else {
			// unknown error: log it, don't leak details to the client
			this.logger.error(
				exception instanceof Error ? exception.stack : String(exception),
			);
		}

		const payload: FailedResponse = {
			status: "FAILED",
			data: {
				statusCode,
				message,
				...(errors && { errors }),
			},
		};

		res.status(statusCode).json(payload);
	}
}
