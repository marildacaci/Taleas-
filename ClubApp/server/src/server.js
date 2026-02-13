require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const startMembershipExpirypJobs = require("./jobs/membershipExpiryJob");

const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);

      startMembershipExpirypJobs();
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });