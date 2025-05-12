const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const os = require("node:os");

const app = require("../../app");
const user = require("../models/user");

let mongo = null;

beforeAll(async () => {
  process.env.TOKEN_KEY = "asdfasdf";
  //jest.setTimeout(10000);

  if (os.platform().toLocaleLowerCase() === "linux") {
    process.env.MONGOMS_DOWNLOAD_URL =
      "https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.1.tgz";
  }

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  mongoose.set("strictQuery", false);
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

exports.activateUser = async () => {
  const record = await user.findOne({ email: "test@test.com" });
  if (record) {
    record.isActive = true;
    await record.save();
  }
};

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
  }
});
