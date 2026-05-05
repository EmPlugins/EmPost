import { describe, expect, it, vi } from "vitest";
import { PluginRouteError } from "emdash";
import { mapContentCreateError } from "../src/map-content-create-error.js";

describe("mapContentCreateError", () => {
	it("maps VALIDATION_ERROR with fields", () => {
		try {
			mapContentCreateError(
				{ code: "VALIDATION_ERROR", message: "Invalid fields", fields: { title: ["required"] } },
				{ error: vi.fn() },
			);
		} catch (e) {
			expect(e).toBeInstanceOf(PluginRouteError);
			const err = e as PluginRouteError;
			expect(err.code).toBe("VALIDATION_ERROR");
			expect(err.status).toBe(400);
			expect(err.message).toBe("Invalid fields");
			expect(err.details).toEqual({ title: ["required"] });
		}
	});

	it("maps SLUG_CONFLICT to 409", () => {
		try {
			mapContentCreateError({ code: "SLUG_CONFLICT", message: "Taken" }, { error: vi.fn() });
		} catch (e) {
			const err = e as PluginRouteError;
			expect(err.code).toBe("SLUG_CONFLICT");
			expect(err.status).toBe(409);
			expect(err.message).toBe("Taken");
		}
	});

	it("maps CONFLICT via PluginRouteError.conflict", () => {
		try {
			mapContentCreateError({ code: "CONFLICT", message: "Merge conflict" }, { error: vi.fn() });
		} catch (e) {
			const err = e as PluginRouteError;
			expect(err.code).toBe("CONFLICT");
			expect(err.status).toBe(409);
			expect(err.message).toBe("Merge conflict");
		}
	});

	it("maps unknown errors to CREATE_FAILED and logs", () => {
		const error = vi.fn();
		try {
			mapContentCreateError(new Error("boom"), { error });
		} catch (e) {
			const err = e as PluginRouteError;
			expect(err.code).toBe("CREATE_FAILED");
			expect(err.status).toBe(400);
			expect(err.message).toBe("Could not create draft");
		}
		expect(error).toHaveBeenCalledWith("content.create failed", {
			err: "Error: boom",
			code: null,
		});
	});
});
