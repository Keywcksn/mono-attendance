import {
	Injectable,
	StreamableFile,
	type NestInterceptor,
	type ExecutionContext,
	type CallHandler,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

// standardised envelope returned by every successful API response.
export interface SuccessResponse<T> {
	status: "SUCCESS";
	data: T;
}

// "status": "SUCCESS", "data": <original response> }
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
	T,
	SuccessResponse<T> | StreamableFile
> {
	intercept(
		_context: ExecutionContext,
		next: CallHandler<T | StreamableFile>,
	): Observable<SuccessResponse<T> | StreamableFile> {
		return next
			.handle()
			.pipe(
				map((data) =>
					data instanceof StreamableFile
						? data
						: { status: "SUCCESS" as const, data },
				),
			);
	}
}
