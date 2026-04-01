import { describe, expect, it } from "@jest/globals";
import { createRequest, createResponse } from "node-mocks-http";

import { errorHandler, notFound, AppError } from "../middleware/error.middleware";

describe("error middleware", () => {
  it("includes a timestamp in 404 responses", () => {
    const req = createRequest({ method: "GET", url: "/missing" });
    const res = createResponse();

    notFound(req, res);

    const payload = res._getJSONData() as {
      error: { code: string; message: string; timestamp: string };
    };

    expect(payload.error.code).toBe("NOT_FOUND");
    expect(payload.error.timestamp).toEqual(expect.any(String));
  });

  it("includes a timestamp in AppError responses", () => {
    const req = createRequest({ method: "GET", url: "/boom" });
    const res = createResponse();

    errorHandler(new AppError("Boom", 400, "BAD_REQUEST"), req, res, () => undefined);

    const payload = res._getJSONData() as {
      error: { code: string; message: string; timestamp: string };
    };

    expect(payload.error.code).toBe("BAD_REQUEST");
    expect(payload.error.timestamp).toEqual(expect.any(String));
  });
});
