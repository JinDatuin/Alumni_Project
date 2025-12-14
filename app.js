const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "node_crud",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to the MySQL database.");
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

app.get("/", (req, res) => {
  res.send("Welcome to the Node.js CRUD application!");
});

app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form.html"));
});

app.get("/login-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/user", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "users.html"));
});

app.post("/users", (req, res) => {
  const { name, email, age } = req.body;
  const query = "INSERT INTO users (name, email, age) VALUES (?, ?, ?)";
  db.query(query, [name, email, age], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send({ message: "User created!", userId: result.insertId });
    }
  });
});

app.get("/users", (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Error fetching users.");
    } else {
      res.json(results);
    }
  });
});

app.put("/users/:id", (req, res) => {
  const { name, email, age } = req.body;
  const query = "UPDATE users SET name=?, email=?, age=? WHERE id=?";
  db.query(query, [name, email, age, req.params.id], (err) => {
    if (err) return res.status(500).send("Update failed");
    res.send({ message: "User updated" });
  });
});

app.delete("/users/:id", (req, res) => {
  const query = "DELETE FROM users WHERE id=?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).send("Delete failed");
    res.send({ message: "User deleted" });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).send("Login error");

    if (results.length === 0) {
      return res.status(401).send("Invalid email or password");
    }

    res.send({ message: "Login successful", user: results[0] });
  });
});
