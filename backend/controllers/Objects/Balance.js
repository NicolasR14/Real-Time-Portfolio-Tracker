const { get_all_balance_defi } = require("../src/defi");
const { get_all_balance_cefi } = require("../src/cefi");
const { get_man_balance } = require("../src/manual_balance");
const { merge_lists, merge_balances } = require("../src/common_functions");
const Prices = require("./Prices");
const axios = require("axios");

class Balance {
  constructor(balance_tot, prices_accessor) {
    this.old_balance = { ...balance_tot };
    this.balance_tot = { ...balance_tot };
    this.composition = [];
    this.evol_total = {};
    this.prices_accessor = prices_accessor;
  }

  async fetchAll() {
    const now = +new Date();
    if (this.balance_tot.last_updated < now - 5 * 60 * 1000) {
      this.balance_tot = {
        last_updated: now,
        balances: [],
        lp_list: [],
        total: {
          usd: 0,
          eur: 0,
          eth: 0,
          btc: 0,
        },
      };
      let defi;
      let cefi;
      let manual;
      const promises = await Promise.all([
        (defi = await get_all_balance_defi()),
        (cefi = await get_all_balance_cefi()),
        (manual = await get_man_balance()),
      ]).then(async () => {
        for (const i of [defi, cefi]) {
          for (const b of i) {
            this.balance_tot.balances.push(b);
          }
        }
        this.balance_tot.balances.push(manual);

        await this.prices_accessor.get_all_prices(this.balance_tot.balances);

        this.balance_tot.lp_list = this.prices_accessor.lp_list;
        this.balance_tot = this.prices_accessor.add_prices(this.balance_tot);
        this.get_total_and_format();
        await this.get_other_currencies_balance();
      });
    }
  }

  async get_other_currencies_balance() {
    await Promise.all([
      await this.prices_accessor.get_price_cg("bitcoin"),
      await this.prices_accessor.get_price_cg("ethereum"),
      await this.prices_accessor.get_price_yf("US", "EURUSD=X"),
    ]);
    this.balance_tot.total.eth =
      this.balance_tot.total.usd / this.prices_accessor.prices["ethereum"].usd;
    this.balance_tot.total.eth = this.balance_tot.total.eth.toFixed(2);
    this.balance_tot.total.btc =
      this.balance_tot.total.usd / this.prices_accessor.prices["bitcoin"].usd;
    this.balance_tot.total.btc = this.balance_tot.total.btc.toFixed(3);
    this.balance_tot.total.eur =
      this.balance_tot.total.usd / this.prices_accessor.prices["EURUSD=X"].usd;
    this.balance_tot.total.eur = this.balance_tot.total.eur.toFixed(2);
  }

  get_total_and_format() {
    let merged_balance = this.mergeAll();
    for (const b of merged_balance) {
      this.balance_tot.total.usd += b.usd_value;
    }
    this.balance_tot.total.usd =
      Math.round(this.balance_tot.total.usd * 100) / 100;
    for (let b of merged_balance) {
      b.amount = Math.round(b.amount * 100) / 100;
      b.usd_value = Math.round(b.usd_value * 100) / 100;
    }
    merged_balance.sort((a, b) => (a.usd_value > b.usd_value ? -1 : 1));
    this.balance_tot.balances = merged_balance;
  }

  async;

  mergeAll() {
    let merged_balance = [];
    for (const b of this.balance_tot.balances) {
      merged_balance = merge_lists([merged_balance, b.balances]);
    }
    return merged_balance;
  }

  get_evolution() {
    for (let asset of this.balance_tot.balances) {
      const old_balance = this.old_balance.balances.find(
        (old_asset) => old_asset.asset === asset.asset
      );

      if (old_balance) {
        asset.evol = (
          (asset.usd_value / old_balance.usd_value - 1) *
          100
        ).toFixed(2);
      }
    }
    this.evol_total.usd =
      (this.balance_tot.total.usd / this.old_balance.total.usd - 1) * 100;
    this.evol_total.eur =
      (this.balance_tot.total.eur / this.old_balance.total.eur - 1) * 100;
    this.evol_total.eth =
      (this.balance_tot.total.eth / this.old_balance.total.eth - 1) * 100;
    this.evol_total.btc =
      (this.balance_tot.total.btc / this.old_balance.total.btc - 1) * 100;
  }

  async get_composition() {
    const _merged_balance = this.balance_tot.balances.map((object) => ({
      ...object,
    }));
    const _lp_list = this.balance_tot.lp_list;
    this.composition = [];
    await Promise.all(
      _merged_balance.map(async (asset) => {
        if (!_lp_list.includes(asset.asset)) {
          merge_balances(asset, this.composition);
          return;
        }
        switch (asset.asset) {
          case "GLP_arbitrum":
            await this.get_glp_compo().then((glp_compo) => {
              for (const a of Object.keys(glp_compo)) {
                merge_balances(
                  {
                    asset: a,
                    amount: 0,
                    usd_value: glp_compo[a] * asset.usd_value,
                  },
                  this.composition
                );
              }
            });
        }
      })
    );
    let others = { asset: "", percentage: 0.0 };

    let total_expo = this.balance_tot.total.usd;
    this.composition.map((a) => {
      if (a.usd_value < 0) {
        total_expo += -a.usd_value;
      }
    });
    console.log(total_expo);
    this.composition = this.composition.flatMap((a) => {
      const percentage = a.usd_value / total_expo;
      if (percentage < 0.03 && percentage > 0) {
        others.percentage += percentage;
        return [];
      }
      if (percentage > -0.03 && percentage < 0) {
        others.percentage += -percentage;
        return [];
      }
      if (percentage < 0) {
        return {
          asset: "-" + a.asset,
          percentage: -percentage,
        };
      }
      return {
        asset: a.asset,
        percentage: percentage,
      };
    });
    this.composition.push(others);
    this.composition.sort((a, b) => (a.percentage > b.percentage ? -1 : 1));
  }

  async get_glp_compo() {
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
}

module.exports = Balance;
