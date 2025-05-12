const request = require("supertest");
const app = require("../../../app");
const {
  validUser,
  createAndLoginUser,
  getCurrentUserData,
  createUser,
  validUser1,
  controlErrObj,
  createSpecificUser,
} = require("../../test/helpers");

describe("Endpoint /admin/getAllUser", () => {
  it("get all user data, length 1", async () => {
    const authHeader = await createAndLoginUser({ isAdmin: true });
    const response = await request(app)
      .get("/admin/getAllUser")
      .set(authHeader)
      .expect(200);
    expect(response.body.length).toBe(1);
  });
  it("got 403 for non admin account", async () => {
    const authHeader = await createAndLoginUser();
    await request(app).get("/admin/getAllUser").set(authHeader).expect(403);
  });
});

describe("Endpoint post /admin/user/", () => {
  it("return 201 when creating user as administrator", async () => {
    const authHeader = await createAndLoginUser({ isAdmin: true });
    const response = await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send(validUser1)
      .expect(201);
    expect(response.body.email).toBe(validUser1.email);
  });
  it("return 403 when tying to create user as administrator", async () => {
    const authHeader = await createAndLoginUser();
    await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send(validUser1)
      .expect(403);
  });
  it("return 400 when required values are missing", async () => {
    const authHeader = await createAndLoginUser({ isAdmin: true });
    let response = await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send({})
      .expect(400);
    await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send({ name: "Slavo" })
      .expect(400);
    await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send({ name: "Slavo", isAdmin: false })
      .expect(400);
    await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send({ name: "Slavo", isAdmin: false, email: "email@email.com" })
      .expect(400);
    await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send({
        name: "Slavo",
        isAdmin: false,
        email: "email@email.com",
        password: "Heslo1234",
      })
      .expect(400);
  });
  it("return 400 on invalid email", async () => {
    const authHeader = await createAndLoginUser({ isAdmin: true });
    const response = await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send({ ...validUser1, email: "emal.com" })
      .expect(400);
  });
  it("return 400 when password doesnt match", async () => {
    const authHeader = await createAndLoginUser({ isAdmin: true });
    await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send({ ...validUser1, password: "not-matched" })
      .expect(400);
  });
  it("return 400 when email exists in DB", async () => {
    const authHeader = await createAndLoginUser({ isAdmin: true });
    //create user
    await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send(validUser1)
      .expect(201);
    //create user with same email
    const response = await request(app)
      .post("/admin/user")
      .set(authHeader)
      .send({ validUser1 })
      .expect(400);
    expect(response.body).toEqual(controlErrObj());
  });
});

describe("Endpoint put /admin/user/", () => {
  it("return 201 edit user as admin", async () => {
    const localUser = await createSpecificUser(validUser1);
    const authHeader = await createAndLoginUser({ isAdmin: true });
    await request(app)
      .put("/admin/user/" + localUser.toString())
      .set(authHeader)
      .send({ name: "changedName" })
      .expect(200);
    const response = await request(app)
      .get("/admin/getAllUser")
      .set(authHeader)
      .expect(200);
    let changedName = "";
    for (const u of response.body) {
      if (u._id.toString() === localUser.toString()) {
        changedName = u.name;
        break;
      }
    }
    expect(changedName).toBe("changedName");
  });
  it("return 404 for non existing user", async () => {
    const authHeader = await createAndLoginUser({ isAdmin: true });
    await request(app)
      .put("/admin/user/63e2b0fb532fe1bd28d8d083")
      .set(authHeader)
      .send({ name: "changedName" })
      .expect(404);
  });
  it("return 400 when updating email to existing email in db", async () => {
    const localUser = await createSpecificUser(validUser1);
    const authHeader = await createAndLoginUser({ isAdmin: true });
    const response = await request(app)
      .put("/admin/user/" + localUser._id.toString())
      .set(authHeader)
      .send({ email: validUser.email })
      .expect(400);
    expect(response.body).toEqual(controlErrObj());
  });
});
describe("Endpoint delete /admin/user/", () => {
  it("return 200 when deleting user as admin", async () => {
    const localUser = await createSpecificUser(validUser1);
    const authHeader = await createAndLoginUser({ isAdmin: true });
    await request(app)
      .delete("/admin/user/" + localUser.toString())
      .set(authHeader)
      .expect(200);
    const response = await request(app)
      .get("/admin/getAllUser")
      .set(authHeader)
      .expect(200);
    expect(response.body.length).toBe(1);
  });
  it("return 404 for deleting non existing user", async () => {
    const authHeader = await createAndLoginUser({ isAdmin: true });
    const response = await request(app)
      .delete("/admin/user/63e2b0fb532fe1bd28d8d083")
      .set(authHeader)
      .expect(404);
    expect(response.body).toEqual(controlErrObj());
  });
});
