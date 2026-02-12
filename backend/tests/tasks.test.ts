import request from "supertest";
import app from "../src/app";

describe("tasks", () => {
  const registerUser = async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "tasker@example.com",
      password: "password123"
    });
    return res.body.token as string;
  };

  it("creates tasks and enforces dependencies", async () => {
    const token = await registerUser();

    const first = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task A",
        priority: "HIGH"
      });

    const second = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task B",
        dependsOnIds: [first.body.task.id]
      });

    const blocked = await request(app)
      .patch(`/api/tasks/${second.body.task.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "DONE" });

    expect(blocked.status).toBe(409);

    await request(app)
      .patch(`/api/tasks/${first.body.task.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "DONE" });

    const done = await request(app)
      .patch(`/api/tasks/${second.body.task.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "DONE" });

    expect(done.status).toBe(200);
    expect(done.body.task.status).toBe("DONE");
  });
});
