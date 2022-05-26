const Histo = require("../models/Histo");
const LastBalance = require("../models/LastBalance");
const BalanceCrypto = require("./Objects/BalanceCrypto");
const Prices = require("./Objects/Prices");

const prices_accessor = new Prices();

exports.getAllBalances = async (req, res, next) => {
  let last_balance = await LastBalance.find();
  let balance = new BalanceCrypto(
    JSON.parse(JSON.stringify(last_balance[0])),
    prices_accessor
  );
  balance
    .getBalance()
    .then(async () => {
      await prices_accessor.get_all_prices_crypto(balance.balance_tot.balances);
      balance.balance_tot = prices_accessor.add_prices(balance.balance_tot);

      balance.get_total_and_format();
      await balance.get_other_currencies_balance();

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
              main: balance.balance_tot.total.main,
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
