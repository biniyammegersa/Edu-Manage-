dotenv.config();
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/auth.route.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import { connectDB } from "./lib/db.js";
import proposalFeedbackRoutes from "./routes/proposalFeedbackRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import projectFeedbackRoutes from "./routes/projectFeedbackRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import chapterSubmissionRoutes from "./routes/chapterSubmissionRoutes.js";
import chapterFeedbackRoutes from "./routes/chapterFeedbackRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint - provides a simple health/info response
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    availableEndpoints: ["/api/auth", "/api/projects", "/api/proposals", "/api/users", "/api/feedback", "/api/documentation"]
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/users", profileRoutes);
app.use("/api/feedback", proposalFeedbackRoutes);
app.use("/api/project", projectFeedbackRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/documentation", chapterSubmissionRoutes);
app.use("/api/documentation/feedback", chapterFeedbackRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected: localhost"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Force the server to run on port 5000 (ignore PORT env)
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  connectDB();
});
