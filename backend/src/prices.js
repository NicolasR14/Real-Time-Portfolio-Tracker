const Ticker = require("../models/Ticker");
const Contract = require("../models/Contract");
const axios = require("axios");

async function get_prices(balances) {
  // var _balance = []
  const stablecoins = ["USDT", "BUSD", "MIM", "FRAX", "USDC"];

  //Liquidity Pools
  var lp_list = await Contract.find({ type: "lp" });
  lp_list = lp_list.map((a) => {
    return a.name;
  });

  let assets_list = [];
  for (const b of balances) {
    for (const a of b.balances) {
      if (
        !assets_list.includes(a.asset) &&
        !lp_list.includes(a.asset) &&
        !stablecoins.includes(a.asset)
      ) {
        assets_list.push(a.asset);
      }
    }
  }

  var dict_tickers = {};
  //Assets
  const asset_tickers = await Promise.all(
    assets_list.map(async (asset) => {
      const ticker = await Ticker.findOne({ name: asset });
      if (!ticker) {
        throw Error(asset + " not found in tickers dictionnary");
      }
      dict_tickers[asset] = ticker.ticker;
      return ticker.ticker;
    })
  ).then((assets) => {
    return assets.join(",");
  });

  const cg_url =
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
    asset_tickers +
    "&vs_currencies=usd";

  let prices = await axios.get(cg_url).then((res) => {
    if (res.status !== 200) {
      throw Error("Request error for coingecko prices");
    }
    return res.data;
  });

  for (const a of lp_list) {
    switch (a) {
      case "GLP_arbitrum":
        prices["GLP_arbitrum"] = { usd: await get_glp_arbi_price() };
        dict_tickers["GLP_arbitrum"] = "GLP_arbitrum";
    }
  }
  return [prices, lp_list, dict_tickers];
}

async function get_glp_arbi_price() {
  const id = '"total"';
  return await axios
    .post("https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats", {
      variables: {},
      query:
        "{\n  glpStats(\n where: {id: " +
        id +
        "}\n) {\n    id\n    aumInUsdg\n    glpSupply\n }\n}\n",
    })
    .then((res) => {
      if (res.status !== 200) {
        throw Error("Request error for GLP price");
      }
      return res.data.data.glpStats[0];
    })
    .then((glpStats) => {
      return glpStats.aumInUsdg / glpStats.glpSupply;
    });
}

function add_prices(balance_tot, prices, dict_tickers) {
  // var _balance = []
  const stablecoins = ["USDT", "BUSD", "MIM", "FRAX", "USDC"];

  var _balance_tot = { last_updated: balance_tot.last_updated, balances: [] };
  for (const source of balance_tot.balances) {
    var balance_source = [];
    var balance_stable = 0;
    for (const balance of source.balances) {
      if (stablecoins.includes(balance.asset)) {
        balance_stable += balance.amount;
        continue;
      }
      try {
        const usd_value =
          balance.amount * prices[dict_tickers[balance.asset]].usd;
        if (usd_value >= 1 || usd_value < 0) {
          balance_source.push({
            asset: balance.asset,
            amount: balance.amount,
            usd_value: usd_value,
          });
        }
      } catch {
        throw Error(balance.asset + " not in ticker dictionnary");
      }
    }
    if (balance_stable > 0 || balance_stable < 0) {
      balance_source.push({
        asset: "USD",
        amount: balance_stable,
        usd_value: balance_stable,
      });
    }
    var _source = source;
    _source.balances = balance_source;
    _balance_tot.balances.push(_source);
  }
  return _balance_tot;
}

module.exports = { get_prices, add_prices };
