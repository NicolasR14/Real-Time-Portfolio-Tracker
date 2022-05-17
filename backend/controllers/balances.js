const Histo = require("../models/Histo");
const Contract = require("../models/Contract");
const { get_all_balance_defi } = require("../src/defi");
const { get_all_balance_cefi } = require("../src/cefi");
const { get_man_balance } = require("../src/manual_balance");
const { merge_lists, merge_balances } = require("../src/common_functions");
const { get_prices, add_prices } = require("../src/prices");
const math = require("mathjs");
const axios = require("axios");

let balance_tot = {
  last_updated: 0,
  balances: [],
  lp_list: [],
};

async function fetchAll() {
  now = +new Date();
  if (balance_tot.last_updated < now - 60 * 1000) {
    balance_tot = {
      last_updated: now,
      balances: [],
    };
    let defi;
    let cefi;
    const promises = await Promise.all([
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
      const [prices, _lp_list, dict_tickers] = await get_prices(
        balance_tot.balances
      );
      balance_tot.lp_list = _lp_list;
      add_prices(balance_tot, prices, dict_tickers);
    });
    console.log("test");
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
  fetchAll()
    .then(async (_balance_tot) => {
      const [total_usd, balances] = get_total_and_format(_balance_tot);
      const [composition, debt] = await get_composition(total_usd, balances);

      await createHisto(total_usd);
      res.status(200).json({
        total_usd: total_usd,
        balances,
        composition,
        debt,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

function get_total_and_format(balance) {
  let merged_balance = mergeAll(balance);
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
  return [total_usd, merged_balance];
}

async function get_composition(total_usd, merged_balance) {
  const _merged_balance = merged_balance.map((object) => ({ ...object }));
  const _lp_list = balance_tot.lp_list;
  let composition = [];
  await Promise.all(
    _merged_balance.map(async (asset) => {
      if (!_lp_list.includes(asset.asset)) {
        merge_balances(asset, composition);
        return;
      }
      switch (asset.asset) {
        case "GLP_arbitrum":
          await get_glp_compo().then((glp_compo) => {
            for (const a of Object.keys(glp_compo)) {
              merge_balances(
                {
                  asset: a,
                  amount: 0,
                  usd_value: glp_compo[a] * asset.usd_value,
                },
                composition
              );
            }
          });
      }
    })
  );
  let others = { asset: "Others", percentage: 0.0 };
  let debt = composition.filter((a) => a.usd_value / total_usd < 0);
  composition = composition
    .filter((a) => !debt.includes(a))
    .flatMap((a) => {
      const percentage = a.usd_value / total_usd;
      if (percentage < 0.03) {
        others.percentage += percentage;
        return [];
      }
      return { asset: a.asset, percentage: a.usd_value / total_usd };
    });
  composition.push(others);
  return [composition, debt];
}

async function get_glp_compo() {
  const TOKEN_ADDRESSES = {
    "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8": "USD",
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9": "USD",
    "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0": "UNI",
    "0xf97f4df75117a78c1a5a0dbb814af92458539fb4": "LINK",
    "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1": "USD",
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": "ETH",
    "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f": "BTC",
    "0x17fc002b466eec40dae837fc4be5c67993ddbd6f": "USD",
  };
  const id = '"hourly"';
  let compo = {};
  return await axios
    .post("https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats", {
      variables: {},
      query:
        "{\n  tokenStats(\n orderBy: timestamp\n orderDirection: desc\n where: {period: daily}\n) {\n    timestamp\n    poolAmountUsd\n    poolAmount\n period\n token\n}\n}\n",
    })
    .then((res) => {
      const data = res.data.data.tokenStats;
      var total_usd = 0;
      for (const a of data) {
        if (a.timestamp === data[0].timestamp) {
          total_usd += parseInt(a.poolAmountUsd);
        }
      }
      for (const a of data) {
        if (a.timestamp === data[0].timestamp) {
          const pool_percent = parseInt(a.poolAmountUsd) / total_usd;
          const token_name = TOKEN_ADDRESSES[a.token];
          if (Object.keys(compo).includes(token_name)) {
            compo[token_name] += pool_percent;
          } else {
            compo[token_name] = pool_percent;
          }
        }
      }
      return compo;
    });
}

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
