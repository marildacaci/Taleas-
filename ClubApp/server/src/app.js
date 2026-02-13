const express = require("express");

const i18n = require("./middlewares/i18n");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const clubRoutes = require("./routes/clubRoutes");
const memberRoutes = require("./routes/memberRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const activityRoutes = require("./routes/activityRoutes");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());
app.use(i18n);

app.get("/", (req, res) => {
  res.json({
    message: req.t("HEALTH_OK"),
    language: req.lang,
    endpoints: [
      "/api/clubs",
      "/api/members",
      "/api/memberships",
      "/api/activities"
    ]
  });
});

app.use("/api/clubs", clubRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/activities", activityRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
