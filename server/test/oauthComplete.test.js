import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";

describe("POST /api/auth/oauth/complete", () => {
  it("rejects missing code", async () => {
    const res = await request(app).post("/api/auth/oauth/complete").send({});
    expect(res.status).toBe(400);
  });

  it("rejects invalid code", async () => {
    const res = await request(app)
      .post("/api/auth/oauth/complete")
      .send({ code: "not-a-real-code" });
    expect(res.status).toBe(400);
  });
});

