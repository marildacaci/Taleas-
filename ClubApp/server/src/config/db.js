const mongoose = require("mongoose");

module.exports = async function connectDB() {
  mongoose.set("autoIndex", process.env.NODE_ENV !== "production");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected!");

  if (process.env.NODE_ENV !== "production") {
    await mongoose.syncIndexes();
    console.log("✅ Indexes synced");
  }
};

console.log("MONGODB_URI =", process.env.MONGODB_URI);

