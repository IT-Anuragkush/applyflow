require("dotenv").config();
const express = require("express");
const path = require("path");
const dns = require("dns");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");

// Fix MongoDB Atlas SRV DNS lookup (required on some Windows systems)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

// Database Connection
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static("public"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

// Frontend Routes

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "landing.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "forgot-password.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

app.get("/jobs", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "jobs.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "profile.html"));
});

// 404 Route
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});