import { describe, expect, it, jest } from "@jest/globals";
import { createRequest, createResponse } from "node-mocks-http";

import { validateQuery } from "../middleware/validate.middleware";
import { paginationQuerySchema } from "../validators/query.schema";

describe("validateQuery", () => {
  it("rejects invalid query parameters", () => {
    const handler = validateQuery(paginationQuerySchema);
    const req = createRequest({
      method: "GET",
      url: "/api/clients?page=abc",
      query: {
        page: "abc",
      },
    });
    const res = createResponse();
    const next = jest.fn();

    handler(req, res, next);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty("timestamp");
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts and coerces valid query parameters", () => {
    const handler = validateQuery(paginationQuerySchema);
    const req = createRequest({
      method: "GET",
      url: "/api/clients?page=2&limit=25",
      query: {
        page: "2",
        limit: "25",
      },
    });
    const res = createResponse();
    const next = jest.fn();

    handler(req, res, next);

    expect(res._getStatusCode()).toBe(200);
    expect(req.query.page).toBe(2);
    expect(req.query.limit).toBe(25);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
