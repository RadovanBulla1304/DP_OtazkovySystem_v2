const request = require("supertest");
const app = require("../../../app");
const { validUser, createUser } = require("../../test/helpers");

describe("Endpoint /public/signin", () => {
  it("returns a 200 on successful signin", async () => {
    await createUser();
    await request(app).post("/public/signin").send(validUser).expect(200);
  });
  it("returns a 400 with invalid credentials", async () => {
    await createUser();
    await request(app)
      .post("/public/signin")
      .send({ email: "test@test.com", password: "invalidPwd" })
      .expect(400);
    await request(app)
      .post("/public/signin")
      .send({ email: "test2@test.com", password: "Heslo1234" })
      .expect(400);
  });
  it("returns a 400 with missing credentials", async () => {
    await createUser();
    await request(app)
      .post("/public/signin")
      .send({ email: "test@test.com" })
      .expect(400);
    await request(app)
      .post("/public/signin")
      .send({ password: "Heslo1234" })
      .expect(400);
  });
});
