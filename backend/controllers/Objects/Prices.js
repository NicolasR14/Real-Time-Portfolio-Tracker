const Ticker = require("../../models/Ticker");
const Contract = require("../../models/Contract");
const axios = require("axios");
const rapidAPIKey = require("../../config.js")

class Prices {
  constructor() {
    this.prices = {};
    this.lp_list = {};
    this.stablecoins = ["USDT", "BUSD", "MIM", "FRAX", "USDC", "USD"];
    this.dict_tickers = {};
    this.yf_options = {
      method: "GET",
      url: "https://yh-finance.p.rapidapi.com/market/v2/get-quotes",
      headers: {
        "X-RapidAPI-Host": "yh-finance.p.rapidapi.com",
        "X-RapidAPI-Key": rapidAPIKey,
      },
    };
    this.refresh_rate = 5 * 60 * 1000;
  }

  async get_price_yf(region, asset_tickers) {
    const now = +new Date();
    if (
      !this.dict_tickers[asset_tickers] ||
      this.dict_tickers[asset_tickers].last_updated < now - this.refresh_rate
    ) {
      let options = this.yf_options;
      options.params = { region: region, symbols: asset_tickers };
      await axios
        .request(options)
        .then((response) => {
          for (const asset of response.data.quoteResponse.result) {
            this.prices[asset.symbol] = {
              value: parseFloat(asset.regularMarketPrice),
              last_updated: now,
            };
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  }

  async get_price_cg(asset_tickers) {
    const now = +new Date();
    if (
      !this.dict_tickers[asset_tickers] ||
      this.dict_tickers[asset_tickers].last_updated < now - this.refresh_rate
    ) {
      const cg_url =
        "https://api.coingecko.com/api/v3/simple/price?ids=" +
        asset_tickers +
        "&vs_currencies=usd";
      await axios.get(cg_url).then((res) => {
        if (res.status !== 200) {
          throw Error("Request error for coingecko prices");
        }
        for (const asset of Object.keys(res.data)) {
          this.prices[asset] = {
            value: parseFloat(res.data[asset].usd),
            last_updated: now,
          };
        }
      });
    }
  }

  async get_asset_tickers(balances) {
    let assets_list = [];
    for (const a of balances) {
      if (
        !assets_list.includes(a.asset) &&
        !this.lp_list.includes(a.asset) &&
        !this.stablecoins.includes(a.asset)
      ) {
        assets_list.push(a.asset);
      }
    }
    //Assets
    return await Promise.all(
      assets_list.map(async (asset) => {
        const ticker = await Ticker.findOne({ name: asset });
        if (!ticker) {
          throw Error(asset + " not found in tickers dictionnary");
        }
        this.dict_tickers[asset] = ticker.ticker;
        return ticker.ticker;
      })
    ).then((assets) => {
      return assets.join(",");
    });
  }

  async get_all_prices_crypto(balances) {
    const now = +new Date();
    //Liquidity Pools
    this.lp_list = await Contract.find({ type: "lp" });
    this.lp_list = this.lp_list.map((a) => {
      return a.name;
    });
    const asset_tickers = await this.get_asset_tickers(balances);
    await Promise.all([
      await this.get_price_cg(asset_tickers),
      await new Promise(async (resolve, reject) => {
        for (const a of this.lp_list) {
          switch (a) {
            case "GLP_arbitrum":
              this.prices["GLP_arbitrum"] = {
                value: await this.get_glp_arbi_price(),
                last_updated: now,
              };
              this.dict_tickers["GLP_arbitrum"] = "GLP_arbitrum";
          }
        }
        resolve();
      }),
    ]);
  }

  async get_glp_arbi_price() {
    const id = '"total"';
    return axios
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

  add_prices(balance_tot) {
    let _balance_tot = {
      last_updated: balance_tot.last_updated,
      balances: [],
      lp_list: this.lp_list,
      total: balance_tot.total,
    };
    let balance_stable = 0;
    for (const balance of balance_tot.balances) {
      if (this.stablecoins.includes(balance.asset)) {
        balance_stable += balance.amount;
        continue;
      }
      try {
        const value =
          balance.amount * this.prices[this.dict_tickers[balance.asset]].value;
        if (value >= 1 || value < 0) {
          _balance_tot.balances.push({
            asset: balance.asset,
            amount: balance.amount,
            value: value,
          });
        }
      } catch {
        throw Error(balance.asset + " not in ticker dictionnary");
      }
    }
    if (balance_stable !== 0) {
      _balance_tot.balances.push({
        asset: "USD",
        amount: balance_stable,
        value: balance_stable,
      });
    }
    return _balance_tot;
  }
}

module.exports = Prices;
