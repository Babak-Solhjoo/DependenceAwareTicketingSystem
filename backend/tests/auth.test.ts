import request from "supertest";
import app from "../src/app";

describe("auth", () => {
  it("registers and logs in", async () => {
    const register = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123"
    });

    expect(register.status).toBe(201);
    expect(register.body.token).toBeDefined();

    const login = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123"
    });

    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();
  });
});
