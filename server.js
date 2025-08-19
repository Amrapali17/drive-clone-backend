 // server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import route files
const authRoutes = require("./routes/auth");
const folderRoutes = require("./routes/folders");
const fileRoutes = require("./routes/files");

const app = express();

// List all allowed frontend URLs
const allowedOrigins = [
  "https://drive-clone-livid.vercel.app", 
  "https://drive-clone-fnrd3pkt4-amrapalis-projects-7cb31848.vercel.app",
  "https://drive-clone-git-main-amrapalis-projects-7cb31848.vercel.app"
];

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);

// Health check route
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
