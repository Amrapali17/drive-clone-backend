// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import route files
const authRoutes = require("./routes/auth");
const folderRoutes = require("./routes/folders");
const fileRoutes = require("./routes/files");

const app = express();

// CORS configuration: allow your frontend deployed on Vercel
const corsOptions = {
  origin: ["https://drive-clone-livid.vercel.app"], // Vercel frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes (relative paths, not full URLs!)
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Drive Clone Backend is running ✅");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
