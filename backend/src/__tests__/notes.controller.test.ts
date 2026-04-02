import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { createRequest, createResponse } from "node-mocks-http";

import { notesController } from "../controllers/notes.controller";
import { notesService } from "../services/notes.service";

describe("notesController.list", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("blocks non-privileged users from reading another user's notes", async () => {
    const listSpy = jest.spyOn(notesService, "list").mockResolvedValue({ data: [] });
    const req = createRequest({
      method: "GET",
      url: "/api/notes",
      query: { authorId: "user-2" },
    });
    req.auth = {
      userId: "user-1",
      email: "user1@example.com",
      role: "employee",
    };
    const res = createResponse();

    await expect(notesController.list(req, res)).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
    expect(listSpy).not.toHaveBeenCalled();
  });

  it("allows admin users to read another user's notes", async () => {
    const listSpy = jest.spyOn(notesService, "list").mockResolvedValue({ data: [] });
    const req = createRequest({
      method: "GET",
      url: "/api/notes",
      query: { authorId: "user-2" },
    });
    req.auth = {
      userId: "admin-1",
      email: "admin@example.com",
      role: "admin",
    };
    const res = createResponse();

    await notesController.list(req, res);

    expect(listSpy).toHaveBeenCalledWith("user-2");
    expect(res.statusCode).toBe(200);
  });
});
