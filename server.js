const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import route files
const authRoutes = require("./routes/auth");
const folderRoutes = require("./routes/folders");
const fileRoutes = require("./routes/files");

const app = express();

// Middleware
const allowedOrigins = [
  "https://drive-clone-frontend.vercel.app",
  "http://localhost:5173" // optional for local dev
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Drive Clone Backend is running ✅");
});

// Handle preflight requests globally
app.options("*", cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
