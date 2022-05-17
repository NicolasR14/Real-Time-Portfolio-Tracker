const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: 30 * 1000,
  max: 1,
  message: "You have exceeded the 1 request/5sec limit!",
  headers: true,
});
