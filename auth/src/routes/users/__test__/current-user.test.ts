import request from "supertest";
import { app } from "../../../app";

it("should return details of the current user", async () => {
  const user = { email: "test@test.com", password: "password" };

  const cookie = await global.signup(user);

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(400);

  expect(response.body.currentUser.email).toEqual(user.email);
});

it("should return null for non signed in user", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
