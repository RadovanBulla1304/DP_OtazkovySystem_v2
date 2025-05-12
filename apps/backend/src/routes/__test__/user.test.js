const request = require("supertest");
const app = require("../../../app");
const {
  validUser,
  createAndLoginUser,
  getCurrentUserData,
} = require("../../test/helpers");

describe("Endpoint /user/current", () => {
  it("get user current data: /user/current", async () => {
    const authHeader = await createAndLoginUser(validUser);
    const response = await getCurrentUserData(authHeader);
    expect(response.body.email).toEqual(validUser.email);
    expect(response.body.isAdmin).toBeFalsy();
  });

  it("create and test admin user /user/current", async () => {
    const authHeader = await createAndLoginUser({ isAdmin: true });
    const response = await getCurrentUserData(authHeader);
    expect(response.body.email).toEqual(validUser.email);
    expect(response.body.isAdmin).toBeTruthy();
  });
  it("returns a 403 when no auth header is set", async () => {
    await request(app).get("/user/current").expect(403);
  });
  it("returns a 401 when not valid auth header is set", async () => {
    let invalidAuthHeader = {
      "x-access-token": "response.body.token",
    };
    await request(app).get("/user/current").set(invalidAuthHeader).expect(401);
  });
});
describe("Endpoint /user/signout", () => {
  it("returns 200 during signout /user/signout", async () => {
    const authHeader = await createAndLoginUser();
    const response = await request(app)
      .post("/user/signout")
      .set(authHeader)
      .expect(200);
    expect(response.body).toEqual({});
  });
});

describe("Endpoint /user/change-password", () => {
  it("returns 200 on change password, then logout and login with new password /user/change-password", async () => {
    const authHeader = await createAndLoginUser();
    let resp = await request(app)
      .post("/user/change-password")
      .set(authHeader)
      .send({
        password: "Heslo4455",
        password_repeat: "Heslo4455",
      })
      .expect(200);
    //logout
    await request(app).post("/user/signout").set(authHeader).expect(200);
    //login again with new password
    const token = await request(app)
      .post("/public/signin")
      .send({ email: validUser.email, password: "Heslo4455" })
      .expect(200);
    expect(token.body.token).toBeDefined();
  });
});

describe("Endpoint /user", () => {
  it("Edit user data: send empty body, name /user/", async () => {
    const authHeader = await createAndLoginUser();
    await request(app).put("/user").set(authHeader).send({}).expect(200);
  });
});
