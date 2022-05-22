const Histo = require("../models/Histo");
const LastBalance = require("../models/LastBalance");
const Balance = require("./Objects/Balance");
const Prices = require("./Objects/Prices");

const prices_accessor = new Prices();

exports.getAllBalances = async (req, res, next) => {
  let last_balance = await LastBalance.find();
  let balance = new Balance(
    JSON.parse(JSON.stringify(last_balance[0])),
    prices_accessor
  );
  balance
    .fetchAll()
    .then(async () => {
      balance.get_evolution();
      await Promise.all([
        balance.get_composition(),
        createHisto(balance.balance_tot.total_usd),
      ]);

      res.status(200).json({
        total_usd: balance.balance_tot.total_usd,
        balances: balance.balance_tot.balances,
        composition: balance.composition,
        debt: balance.debt,
      });
      LastBalance.updateOne(
        {},
        {
          $set: {
            balances: balance.balance_tot.balances,
            last_updated: balance.balance_tot.last_updated,
            lp_list: balance.balance_tot.lp_list,
            total_usd: balance.balance_tot.total_usd,
          },
        }
      ).then(() => console.log("LastBalance actualisée"));
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};
async function createHisto(total_usd) {
  let today = new Date().setHours(0, 0, 0, 0);
  Histo.findOne({ day: today }).then(async (h) => {
    await Promise.all([
      await prices_accessor.get_price_cg("bitcoin"),
      await prices_accessor.get_price_cg("ethereum"),
      await prices_accessor.get_price_yf("US", "EURUSD=X"),
    ]);
    let balance_eth = total_usd / prices_accessor.prices["ethereum"].usd;
    let balance_btc = total_usd / prices_accessor.prices["bitcoin"].usd;
    let balance_eur = total_usd / prices_accessor.prices["EURUSD=X"].usd;
    if (h) {
      Histo.updateOne(
        { day: today },
        {
          $set: {
            balance: total_usd,
            balance_eth: balance_eth,
            balance_btc: balance_btc,
            balance_eur: balance_eur,
          },
        }
      ).then(() => console.log("Historique du jour actualisé"));
    } else {
      const histo = new Histo({
        day: today,
        balance: total_usd,
        balance_eth: balance_eth,
        balance_btc: balance_btc,
        balance_eur: balance_eur,
      });
      histo.save();
    }
  });
}
