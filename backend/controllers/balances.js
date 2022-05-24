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
        createHisto(balance.balance_tot.total),
      ]);

      res.status(200).json({
        total: {
          usd: balance.balance_tot.total.usd,
          eur: balance.balance_tot.total.eur,
          eth: balance.balance_tot.total.eth,
          btc: balance.balance_tot.total.btc,
        },
        balances: balance.balance_tot.balances,
        composition: balance.composition,
        evolution: balance.evol_total,
        debt: balance.debt,
      });
      LastBalance.updateOne(
        {},
        {
          $set: {
            balances: balance.balance_tot.balances,
            last_updated: balance.balance_tot.last_updated,
            lp_list: balance.balance_tot.lp_list,
            total: {
              usd: balance.balance_tot.total.usd,
              eur: balance.balance_tot.total.eur,
              eth: balance.balance_tot.total.eth,
              btc: balance.balance_tot.total.btc,
            },
          },
        }
      ).then(() => console.log("LastBalance actualisée"));
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};
async function createHisto(total) {
  let today = new Date().setHours(0, 0, 0, 0);
  Histo.findOne({ day: today }).then(async (h) => {
    if (h) {
      Histo.updateOne(
        { day: today },
        {
          $set: {
            balance: total.usd,
            balance_eth: total.eth,
            balance_btc: total.btc,
            balance_eur: total.eur,
          },
        }
      ).then(() => console.log("Historique du jour actualisé"));
    } else {
      const histo = new Histo({
        day: today,
        balance: total.usd,
        balance_eth: total.eth,
        balance_btc: total.btc,
        balance_eur: total.eur,
      });
      histo.save();
    }
  });
}
