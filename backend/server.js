require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Connect DB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));