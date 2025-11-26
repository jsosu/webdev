const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// SIGNUP ROUTE
app.post("/api/signup", async (req, res) => {
  const { firstname, email, password } = req.body;

  if (!firstname || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if email already exists
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    await pool.query(
      "INSERT INTO users (firstname, email, password) VALUES ($1, $2, $3)",
      [firstname, email, hashedPassword]
    );

    res.json({ message: "Account created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// LOGIN ROUTE
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    res.json({ message: "Login successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
