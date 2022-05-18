const Histo = require("../models/Histo");
const LastBalance = require("../models/LastBalance");
const Balance = require("./Objects/Balance");

exports.getAllBalances = async (req, res, next) => {
  let last_balance = await LastBalance.find();
  let balance = new Balance(JSON.parse(JSON.stringify(last_balance[0])));
  balance
    .fetchAll()
    .then(async () => {
      balance.get_evolution();
      await Promise.all([
        balance.get_composition(),
        createHisto(balance.total_usd),
      ]);

      res.status(200).json({
        total_usd: balance.total_usd,
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
  await Histo.findOne({ day: today }).then((h) => {
    if (h) {
      Histo.updateOne({ day: today }, { $set: { balance: total_usd } }).then(
        () => console.log("Historique du jour actualisé")
      );
    } else {
      const histo = new Histo({
        day: today,
        balance: total_usd,
      });
      histo.save();
    }
  });
}
