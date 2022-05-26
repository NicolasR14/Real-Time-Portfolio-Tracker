const { get_all_balance_defi } = require("../src/defi");
const { get_all_balance_cefi } = require("../src/cefi");
const { get_man_balance } = require("../src/manual_balance");
const { merge_lists, merge_balances } = require("../src/common_functions");
const Prices = require("./Prices");
const axios = require("axios");

class Balance {
  constructor(balance_tot, prices_accessor, main_currency = "usd") {
    this.old_balance = { ...balance_tot };
    this.balance_tot = { ...balance_tot };
    this.composition = [];
    this.debt = [];
    this.evol_total = {};
    this.prices_accessor = prices_accessor;
    this.main_currency = main_currency;
    this.delay = 0.2 * 60 * 1000;
  }
  async getBalance() {
    const now = +new Date();
    if (this.balance_tot.last_updated < now - this.delay) {
      this.balance_tot = {
        last_updated: now,
        balances: [],
        total: {
          main: 0,
          usd: 0,
          eur: 0,
          eth: 0,
          btc: 0,
        },
      };
      await this.fetchAll();
    }
  }

  async fetchAll() {}

  async get_other_currencies_balance() {
    await Promise.all([
      await this.prices_accessor.get_price_cg("bitcoin"),
      await this.prices_accessor.get_price_cg("ethereum"),
      await this.prices_accessor.get_price_yf("US", "EURUSD=X"),
    ]);
    switch (this.main_currency) {
      case "usd":
        this.balance_tot.total.usd = this.balance_tot.total.main;
        this.balance_tot.total.eur =
          this.balance_tot.total.usd /
          this.prices_accessor.prices["EURUSD=X"].value;
        this.balance_tot.total.eur = parseFloat(
          this.balance_tot.total.eur.toFixed(2)
        );
        break;
      case "eur":
        this.balance_tot.total.eur = this.balance_tot.total.main;
        this.balance_tot.total.usd =
          this.balance_tot.total.eur *
          this.prices_accessor.prices["EURUSD=X"].value;
        this.balance_tot.total.usd = parseFloat(
          this.balance_tot.total.usd.toFixed(2)
        );
        break;
    }
    this.balance_tot.total.eth =
      this.balance_tot.total.usd /
      this.prices_accessor.prices["ethereum"].value;
    this.balance_tot.total.eth = parseFloat(
      this.balance_tot.total.eth.toFixed(2)
    );
    this.balance_tot.total.btc =
      this.balance_tot.total.usd / this.prices_accessor.prices["bitcoin"].value;
    this.balance_tot.total.btc = parseFloat(
      this.balance_tot.total.btc.toFixed(3)
    );
  }

  get_total_and_format() {
    for (const b of this.balance_tot.balances) {
      this.balance_tot.total.main += b.value;
    }
    this.balance_tot.total.main =
      Math.round(this.balance_tot.total.main * 100) / 100;
    for (let b of this.balance_tot.balances) {
      b.amount = Math.round(b.amount * 100) / 100;
      b.value = Math.round(b.value * 100) / 100;
    }
    this.balance_tot.balances.sort((a, b) => (a.value > b.value ? -1 : 1));
  }

  get_evolution() {
    for (let asset of this.balance_tot.balances) {
      const old_balance = this.old_balance.balances.find(
        (old_asset) => old_asset.asset === asset.asset
      );
      if (old_balance) {
        asset.evol = ((asset.value / old_balance.value - 1) * 100).toFixed(2);
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
    this.composition = [];
    this.balance_tot.balances.map(async (asset) => {
      merge_balances(asset, this.composition);
      return;
    });
    format_composition();
  }

  format_composition() {
    let others = { asset: "Others", percentage: 0.0 };
    let total_debt = this.balance_tot.total.main;
    for (const a of this.composition) {
      if (a.value < 0) {
        this.debt.push({ asset: a.asset, percentage: -a.value });
        total_debt += -a.value;
      }
    }

    this.composition = this.composition.flatMap((a) => {
      const percentage = a.value / total_debt;
      if (percentage < 0.03 && percentage > 0) {
        others.percentage += percentage;
        return [];
      }
      if (percentage < 0) {
        return [];
      }
      return {
        asset: a.asset,
        percentage: percentage,
      };
    });
    this.composition.push(others);

    this.debt.push({
      asset: "Propre",
      percentage: this.balance_tot.total.main,
    });
    for (const a of this.debt) {
      a.percentage = a.percentage / total_debt;
    }
    this.composition.sort((a, b) => (a.percentage > b.percentage ? -1 : 1));
    this.debt.sort((a, b) => (a.percentage > b.percentage ? 1 : -1));
  }
}

module.exports = Balance;
