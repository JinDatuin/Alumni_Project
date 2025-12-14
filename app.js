const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

// Session middleware
app.use(
  session({
    secret: "your_secret_key", // In production, use an environment variable
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "node_alumni_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to the MySQL database.");
  }
});

const saltRounds = 10;

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/survey");
  } else {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  }
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).send("Error hashing password");
    }
    const query = "INSERT INTO users (email, password) VALUES (?, ?)";
    db.query(query, [email, hash], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).send("User with this email already exists.");
        }
        return res.status(500).send("Database error on user creation.");
      }
      res.redirect("/"); // Redirect to login page after successful registration
    });
  });
});


app.get("/survey", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "survey.html"));
});

app.get("/questions", isAuthenticated, (req, res) => {
  const query = "SELECT * FROM questions";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Error fetching questions.");
    } else {
      res.json(results);
    }
  });
});

app.post("/survey", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const answers = req.body;

  const query = "INSERT INTO user_answers (user_id, question_id, answer_text) VALUES ?";
  const values = Object.keys(answers).map((key) => {
    const questionId = key.split("_")[1];
    return [userId, questionId, answers[key]];
  });

  if (values.length === 0) {
    return res.status(400).send("No answers submitted.");
  }

  db.query(query, [values], (err, result) => {
    if (err) {
      return res.status(500).send("Error submitting survey.");
    }
    // Redirect to a confirmation page or job history page
    res.redirect("/job-history");
  });
});

app.get("/job-history", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "job_history.html"));
});

app.post("/job-history", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const { company_name, position, start_date, end_date } = req.body;

  const query = "INSERT INTO job_history (user_id, company_name, position, start_date, end_date) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [userId, company_name, position, start_date, end_date || null], (err, result) => {
    if (err) {
      return res.status(500).send("Error adding job history.");
    }
    // Can redirect to a "thank you" page or back to the job history to add more
    res.redirect("/job-history");
  });
});
