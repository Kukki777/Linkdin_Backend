import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// ================= MIDDLEWARE FIRST =================
app.use(cors());

app.use(express.json()); // ✅ before routes
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use("/uploads", express.static("uploads"));

// ================= ROUTES AFTER =====================
app.use(postRoutes);
app.use(userRoutes);

// ====================================================

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("DB error:", error);
    process.exit(1);
  }
};

start();
