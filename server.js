// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import route files
const authRoutes = require("./routes/auth");
const folderRoutes = require("./routes/folders");
const fileRoutes = require("./routes/files");

const app = express();

// ----------------------
// CORS Setup
// ----------------------
const allowedOrigins = [
  "http://localhost:5173", // local frontend for testing
  "https://drive-clone-livid.vercel.app",
  "https://drive-clone-fnrd3pkt4-amrapalis-projects-7cb31848.vercel.app",
  "https://drive-clone-git-main-amrapalis-projects-7cb31848.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ----------------------
// 🔍 Environment Debug (REMOVE after testing!)
// ----------------------
console.log("🔍 ENV CHECK:");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL || "❌ Missing");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Loaded" : "❌ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing");

// ----------------------
// API Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);

// ----------------------
// Health Check
// ----------------------
app.get("/", (req, res) => {
  res.send("Drive Clone Backend is running ✅");
});

// ----------------------
// Global Error Handler
// ----------------------
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  if (err.message.startsWith("CORS")) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: "Something went wrong!" });
});

// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) {
  console.error("⚠️  JWT_SECRET is missing in environment variables!");
  process.exit(1);
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
