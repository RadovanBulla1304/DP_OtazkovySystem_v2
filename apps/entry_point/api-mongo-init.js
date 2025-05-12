db.createUser({
  user: "mongoUser",
  pwd: "hatatitla123*+465",
  roles: [
    {
      role: "dbOwner",
      db: "api",
    },
  ],
});
