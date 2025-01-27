// Import the Express library
const express = require("express");
const addRow = require("./database/addRow");
const getRows = require("./database/getRows");
const deleteRow = require("./database/deleteRow");
const updateRow = require("./database/updateRow");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
//! For Users
app.post("/userRegister", (req, res) => {
  const { email, name, password } = req.body;
  try {
    const rows = getRows("users", `WHERE email = '${email}'`);

    if (rows.length > 0) {
      res.status(200).send({
        state: false,
        msg: "Email is Already Exists",
      });
    } else {
      var rees = addRow("users", {
        name: name,
        email: email,
        password: password,
      });
      if (!rees.state) {
        res.status(400).send({ error: rees.msg });
      }
      const user = getRows("users", `WHERE email = '${email}'`)[0];
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

app.get("/userLogin", (req, res) => {
  const { email, password } = req.body;
  try {
    const rows = getRows("users", `WHERE email = '${email}'`);

    if (rows.length == 0) {
      res.status(200).send({ state: false, msg: "Wrong Email Or Password" });
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

app.delete("/deleteUser/:userID", (req, res) => {
  var userID = req.params.userID;
  try {
    var re = deleteRow("users", userID);
    deleteAllNoteFor(userId);
    if (re) {
      res.status(200).send({ state: true, msg: "Delete User Successfully" });
    } else {
      res.status(200).send({ state: false, msg: "Delete User Failed" });
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

app.put("/updateUser", (req, res) => {
  const { id, name, password } = req.body;
  const newValues = {
    name: name,
    password: password,
  };
  try {
    var re = updateRow("users", id, newValues);
    if (re != false) {
      console.log(re);
      res
        .status(200)
        .send({ state: true, msg: "Update User Successfully", user: re[0] });
    } else {
      res.status(200).send({ state: false, msg: "Update User Failed" });
    }
  } catch (error) {
    res.status(400).send({ state: false, msg: "Update User Failed" });
  }
});
//! For Users
//ToDo لما تحذف شخص يحذف عل النوت تبعاته
//@For Notes
app.post("/addNote", (req, res) => {
  const { title, body, date, userId } = req.body;
  try {
    var rees = addRow("notes", {
      title: title,
      body: body,
      date: date,
      userId: userId,
    });

    if (!rees.state) {
      res.status(200).send({ error: rees.msg });
    }
    const note = getRows("notes", `WHERE id = '${rees.index}'`)[0];
    res.status(200).send({
      state: true,
      msg: "Add Note Successfully",
      note: note,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});
app.get("/getNoteFor/:userId", (req, res) => {
  var userId = req.params.userId;
  try {
    var rows = getRows("notes", `WHERE userId = '${userId}'`);

    if (rows.length > 0) {
      res
        .status(200)
        .send({ state: true, msg: "Get all Note For ${userId}", notes: rows });
    } else {
      res.status(200).send({
        state: false,
        msg: "Get all Note Failed",
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});
app.delete("/deleteNote/:noteId", (req, res) => {
  var noteId = req.params.noteId;
  try {
    var re = deleteRow("notes", noteId);
    if (re) {
      res.status(200).send({ state: true, msg: "Delete Note Successfully" });
    } else {
      res.status(200).send({ state: false, msg: "Delete Note Failed" });
    }
  } catch (error) {
    res.status(400).send("Delete Note Failed");
  }
});
app.put("/updateNote", (req, res) => {
  const { id, title, body } = req.body;
  const newValues = {
    title: title,
    body: body,
  };
  try {
    var re = updateRow("notes", id, newValues);
    if (re != false) {
      console.log(re);
      res
        .status(200)
        .send({ state: true, msg: "Update Note Successfully", note: re[0] });
    } else {
      res.status(200).send({ state: false, msg: "Update User Failed" });
    }
  } catch (error) {
    res.status(400).send({ state: false, msg: "Update User Failed" });
  }
});
app.delete("/deleteAllNoteFor/:userId", (req, res) => {
  var userId = req.params.userId;
  var r = deleteAllNoteFor(userId);
  if (r) {
    res.status(200).send("Delete All Note Successfully");
  } else {
    res.status(200).send("Delete All Note Failed");
  }
});
function deleteAllNoteFor(userId) {
  try {
    var rows = getRows("notes", `WHERE userId = '${userId}'`);

    if (rows.length > 0) {
      for (const notee in rows) {
        deleteRow("notes", rows[notee]["id"]);
      }
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
//@For Notes

// Start the server and listen on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
