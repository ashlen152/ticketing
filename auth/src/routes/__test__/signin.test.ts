import request from "supertest";
import app from "../../app";

it("returns a 400 when email does not exist is supplied", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400);
});

it("fail when an incorrect password is supplied", async () => {
  await signin();

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "test",
    })
    .expect(400);
});

it("returns a 201 on successful signin", async () => {
  await signin();

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
