import { PluginRouteError } from "emdash";

export type ContentCreateLog = {
	error: (msg: string, meta?: Record<string, unknown>) => void;
};

function partsFromUnknown(e: unknown): { code?: string; message: string; fields?: unknown } {
	if (e !== null && typeof e === "object") {
		const o = e as Record<string, unknown>;
		const code = typeof o.code === "string" ? o.code : undefined;
		let message: string;
		if (typeof o.message === "string") {
			message = o.message;
		} else if (e instanceof Error) {
			message = e.message;
		} else {
			message = String(e);
		}
		const fields = "fields" in o ? o.fields : undefined;
		return { code, message, fields };
	}
	return { message: e instanceof Error ? e.message : String(e) };
}

/**
 * Maps errors from `ctx.content.create` into `PluginRouteError` using EmDash 0.8+ structured codes.
 */
export function mapContentCreateError(e: unknown, log: ContentCreateLog): never {
	const { code, message, fields } = partsFromUnknown(e);

	switch (code) {
		case "VALIDATION_ERROR":
			throw new PluginRouteError("VALIDATION_ERROR", message || "Validation failed", 400, fields);
		case "SLUG_CONFLICT":
			throw new PluginRouteError("SLUG_CONFLICT", message || "Slug conflict", 409, fields);
		case "CONFLICT":
			throw PluginRouteError.conflict(message || "Conflict", fields);
		case "NOT_FOUND":
			throw new PluginRouteError("NOT_FOUND", message || "Not found", 400, fields);
		default:
			log.error("content.create failed", { err: String(e), code: code ?? null });
			throw new PluginRouteError(
				"CREATE_FAILED",
				"Could not create draft",
				400,
				code ? { causeCode: code } : undefined,
			);
	}
}
