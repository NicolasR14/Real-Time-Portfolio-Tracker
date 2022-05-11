const Histo = require("../models/Histo");
const Contract = require("../models/Contract");
const { get_all_balance_defi } = require("../src/defi");
const { get_all_balance_cefi } = require("../src/cefi");
const { get_man_balance } = require("../src/manual_balance");
const { merge_lists } = require("../src/common_functions");
const { get_prices, add_prices } = require("../src/prices");
const math = require("mathjs");

let balance_tot = {
  last_updated: 0,
  balances: [],
};

async function fetchAll() {
  now = +new Date();
  if (balance_tot.last_updated < now - 60000) {
    balance_tot = {
      last_updated: now,
      balances: [],
    };
    var defi;
    var cefi;
    return await Promise.all([
      (defi = await get_all_balance_defi()),
      (cefi = await get_all_balance_cefi()),
      (manual = await get_man_balance()),
    ]).then(async () => {
      for (i of [defi, cefi]) {
        for (b of i) {
          balance_tot.balances.push(b);
        }
      }
      balance_tot.balances.push(manual);
      const [prices, lp_list, dict_tickers] = await get_prices(
        balance_tot.balances
      );
      return (balance_tot = add_prices(
        balance_tot,
        prices,
        lp_list,
        dict_tickers
      ));
    });
  }
  return balance_tot;
}

function mergeAll(_balance_tot) {
  let merged_balance = [];
  for (const b of _balance_tot.balances) {
    merged_balance = merge_lists([merged_balance, b.balances]);
  }
  return merged_balance;
}

exports.getAllBalances = async (req, res, next) => {
  await fetchAll()
    .then(async (_balance_tot) => {
      // res.status(200).json(_balance_tot)})
      let merged_balance = mergeAll(_balance_tot);

      let total_usd = 0;
      for (const b of merged_balance) {
        total_usd += b.usd_value;
      }
      total_usd = Math.round(total_usd * 100) / 100;
      for (let b of merged_balance) {
        b.amount = Math.round(b.amount * 100) / 100;
        b.usd_value = Math.round(b.usd_value * 100) / 100;
      }
      merged_balance.sort((a, b) => (a.usd_value > b.usd_value ? -1 : 1));
      // res.status(200).json(_balance_tot)})
      await createHisto(total_usd);
      res.status(200).json({ total_usd: total_usd, merged_balance });
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
