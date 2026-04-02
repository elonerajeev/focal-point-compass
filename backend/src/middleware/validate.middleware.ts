import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodTypeAny } from "zod";

function createValidator(schema: ZodTypeAny, source: "body" | "query"): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === "body" ? req.body : req.query);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: source === "body" ? "Invalid request body" : "Invalid query parameters",
          details: result.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (source === "body") {
      req.body = result.data;
    } else if (source === "query") {
      Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
    }

    next();
  };
}

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return createValidator(schema, "body");
}

export function validateQuery(schema: ZodTypeAny): RequestHandler {
  return createValidator(schema, "query");
}
