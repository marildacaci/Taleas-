const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing. Check your .env and dotenv loading.");
  }

  mongoose.set("autoIndex", process.env.NODE_ENV !== "production");
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, 
    });

    console.log("MongoDB connected!");

    if (process.env.NODE_ENV !== "production") {
      try {
        await mongoose.syncIndexes();
        console.log("Indexes synced");
      } catch (idxErr) {
        console.warn("Index sync warning:", idxErr?.message || idxErr);
      }
    }
  } catch (err) {
    console.error("MongoDB connection failed:", err?.message || err);
    throw err;
  }
};
