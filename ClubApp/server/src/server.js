require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true
  })
);

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env");

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("✅ MongoDB connected!");
}

// ✅ MOUNT ROUTES
const apiRoutes = require("./routes");
app.use("/api", apiRoutes);

(async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, () =>
      console.log(`🚀 Server running on http://localhost:${port}`)
    );
  } catch (err) {
    console.error("Failed to start:", err.message);
    process.exit(1);
  }
})();
