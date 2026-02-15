require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const authJwt = require("./middlewares/authJwt"); // lexon Bearer token dhe vendos req.user
const errorHandler = require("./middlewares/errorHandler");

const routes = require("./routes"); // routes/index.js
const { startMembershipJobs } = require("./jobs/membershipJobs");
const { runMigrations } = require("./migrations/runMigrations");


const app = express();

app.use(express.json());

app.use(authJwt);

app.get("/", (req, res) => {
  res.json({ ok: true, message: "API running" });
});

app.use("/api", routes);

app.use(errorHandler);

async function start() {
  await connectDB();
  await runMigrations();

  startMembershipJobs();

  const PORT = Number(process.env.PORT || 5000);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((e) => {
  console.error("Startup failed:", e);
  process.exit(1);
});
