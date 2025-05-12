const request = require("supertest");
const app = require("../../app");
const user = require("../models/user");

const validUser = {
  name: "test user",
  email: "test@test.com",
  password: "Heslo2345",
  password_repeat: "Heslo2345",
};
const validUser1 = {
  name: "test user1",
  email: "tes1t@test.com",
  password: "Heslo2345",
  password_repeat: "Heslo2345",
  isAdmin: false,
};
const validUser2 = {
  name: "test user2",
  email: "test2@test.com",
  password: "Heslo2345",
  password_repeat: "Heslo2345",
  isAdmin: false,
};

const controlErrObj = () => {
  return expect.objectContaining({
    message: expect.any(String),
    reason: expect.any(String),
  });
};

const createSpecificUser = async (useObj) => {
  const userNew = new user(useObj);
  userNew.setPassword(useObj.password);

  await userNew.save();
  return userNew._id;
};

const createUser = async (config = {}) => {
  const localConfig = {
    isAdmin: config.isAdmin || false,
  };

  const userNew = new user({ ...localConfig, ...validUser, isActive: true });
  userNew.setPassword(validUser.password);

  await userNew.save();
  return userNew._id;
};

const getCurrentUserData = async (authHeader = {}) => {
  return await request(app).get("/user/current").set(authHeader).expect(200);
};

const createAndLoginUser = async (config = {}) => {
  await createUser(config);
  const response = await request(app)
    .post("/public/signin")
    .send({ email: "test@test.com", password: "Heslo2345" });
  expect(response.statusCode).toEqual(200);
  return {
    "x-access-token": response.body.token,
  };
};

exports.validUser = validUser;
exports.validUser1 = validUser1;
exports.validUser2 = validUser2;
exports.createUser = createUser;
exports.getCurrentUserData = getCurrentUserData;
exports.createAndLoginUser = createAndLoginUser;
exports.controlErrObj = controlErrObj;
exports.createSpecificUser = createSpecificUser;
