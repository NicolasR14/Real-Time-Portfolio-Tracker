const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const addressesRoutes = require("./routes/addresses.js");
const api_keysRoutes = require("./routes/api_keys.js");
const balancesRoutes = require("./routes/balances.js");
const api_contractsRoutes = require("./routes/contracts.js");
const tickersRoutes = require("./routes/tickers.js");
const histoRoutes = require("./routes/histo.js");
const manBalRoutes = require("./routes/manual_balance.js");
const url_mongo = require("config.js")

mongoose
  .connect(
    `mongodb+srv://${url_mongo}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/api/addresses", addressesRoutes);
app.use("/api/balance", balancesRoutes);
app.use("/api/api_keys", api_keysRoutes);
app.use("/api/contracts", api_contractsRoutes);
app.use("/api/tickers", tickersRoutes);
app.use("/api/histo", histoRoutes);
app.use("/api/man_bal", manBalRoutes);

module.exports = app;
