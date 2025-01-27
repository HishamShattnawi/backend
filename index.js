// Import the Express library
const express = require("express");
const addRow = require("./database/addRow");
const getRows = require("./database/getRows");
const db = require("./database/db");
const e = require("express");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/test", (req, res) => {
  var user =getRows("users", "");
  res.status(200).send(user[0]["name"]);
})

app.get("/userLogin", (req, res) => {
  const { phone, password } = req.body;
  const query = `SELECT * FROM users WHERE phone = '${phone}' Or email = '${phone}'`;
  try {
    const stmt = db.prepare(query);
    const rows = stmt.all();
    if (rows.length == 0) {
      res
        .status(200)
        .send({ state: false, msg: "Wrong Phone Number Or Password" });
      return;
    }
    if (rows[0].password == password) {
      res.status(200).send({ state: true, user: rows[0] });
    } else {
      res
        .status(200)
        .send({ state: false, msg: "Wrong Phone Number Or Password" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/userRegister", (req, res) => {
  const { email, phone, name, image, password } = req.body;
  const query = `SELECT * FROM users WHERE phone = '${phone}' Or email = '${email}'`;
  try {
    const stmt = db.prepare(query);
    const rows = stmt.all();
    if (rows.length > 0) {
      res.status(200).send({
        state: false,
        msg: "Phone Number Or Email Already Exists",
      });
    } else {
      var rees = addRow("users", {
        email: email,
        phone: phone,
        name: name,
        image: image,
        password: password,
      });
      if (!rees.state) {
        res.status(400).send({ error: rees.msg });
      }
      const user = getRows("users", `WHERE phone = '${phone}'`)[0];
      res.status(200).send({
        state: true,
        msg: "Create User Successfully",
        user: user,
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Start the server and listen on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
