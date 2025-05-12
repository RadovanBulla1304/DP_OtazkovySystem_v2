
db = db.getSiblingDB('otazkovySystem');

db.createCollection('users');

db.users.insertOne({
  _id: ObjectId("674eeff9905626a10bafafd8"),
  email: "superAdmin@uniza.sk",
  isAdmin: true,
  isActive: true,
  name: "Administrator",
  salt: "1303101d4b017af44dc8757ff905344b",
  password: "158506dc9765fe8b890f7e0589a5b7cdc4449ca12490a182cac3c4eafd6c3129c60985…",
  createdAt: ISODate("2024-12-03T11:48:09.795Z"),
  updatedAt: ISODate("2024-12-03T11:48:09.795Z"),
  __v: 0
});

db.createUser({
  user: "mongoUser",
  pwd: "hatatitla123*+465",
  roles: [
    {
      role: "dbOwner",
      db: "otazkovySystem",
    },
  ],
});