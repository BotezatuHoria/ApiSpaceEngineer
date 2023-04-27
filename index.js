const express = require("express");
const bodyParser = require("body-parser");
const PORT = 8080;
const db = require("./utils/db");
const checks = require("./utils/checks");
const { hash } = require("./utils/hash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
async function init() {
  try {
    await db.init();
    app.listen(PORT, () => console.log(`works on http://localhost:${PORT}`));
  } catch (e) {
    console.log(`Failed due to ${e.message}`);
  }
}

app.get("/user", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashResult = hash(password);
  const hashedPassword = hashResult.hashedPassword;
  const user = await db.findUserByEmailAndHashedPassword(email, hashedPassword);
  console.log(user);
  res.send({
    data: user,
  });
});

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;
  const hashResult = hash(password);
  const hashedPassword = hashResult.hashedPassword;
  const UserResult = await db.createUser(
    email,
    firstName,
    lastName,
    hashedPassword
  );
  console.log(UserResult);
  res.send({
    data: UserResult,
  });
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashResult = hash(password);
  const hashedPassword = hashResult.hashedPassword;
  const userResult = await db.findUserByEmailAndHashedPassword(
    email,
    hashedPassword
  );
  const { user } = userResult;
  console.log(user);
  res.send({
    status: "success",
    data: user,
  });
});

init();
//main();
