const axios = require("axios");
const API_key = require("../../models/API_key");
const { Spot } = require("@binance/connector");
const { decrypt } = require("../src/crypt");
const crypto = require("crypto");
const { errorMonitor } = require("events");
const { merge_balances, merge_lists } = require("../src/common_functions");

async function get_all_balance_cefi() {
  const balances = await API_key.find()
    .then((keys) => {
      return keys.filter((k) =>
        ["binance", "jm"].includes(k.name)
      );
    })
    .then(async (cexs) => {
      const _balances = await Promise.all(
        cexs.map(async (cex) => {
          switch (cex.name) {
            case "binance":
              return await get_binance(cex);
            case "ftx":
              return await get_ftx(cex);
            case "kucoin":
              return await get_kucoin(cex);
            case "jm":
              return await get_jm(cex);
          }
        })
      );
      return _balances;
    })
    .catch((error) => {
      console.log(error);
    });
  return balances;
}

async function get_binance(cex) {
  const API_key = decrypt(cex.api_key);
  const API_secret = decrypt(cex.api_secret);
  const client = new Spot(API_key, API_secret);

  async function get_spot() {
    const balances = await client
      .account()
      .then((response) => {
        if (response.statusText === "OK" && response.data.balances) {
          return response.data.balances;
        } else throw Error("Error spot binance API");
      })
      .then((balances) => {
        var _balances = [];
        for (const b of balances.filter((b) => b.free > 0)) {
          _balances.push({
            asset: b.asset,
            amount: parseFloat(b.free) + parseFloat(b.locked),
          });
        }
        return _balances;
      })
      .catch((error) => {
        console.log(error);
        return [];
      });
    return balances;
  }
  async function get_margin() {
    const balances = await client
      .marginAccount()
      .then((response) => {
        if (response.statusText !== 200 && response.data.userAssets) {
          return response.data.userAssets;
        } else throw Error("Error margin binance API");
      })
      .then((balances) => {
        var _balances = [];
        for (const b of balances.filter(
          (b) => b.free > 0 || b.locked > 0 || b.borrowed > 0
        )) {
          _balances.push({
            asset: b.asset,
            amount:
              parseFloat(b.free) +
              parseFloat(b.locked) -
              parseFloat(b.borrowed),
          });
        }
        return _balances;
      })
      .catch((error) => {
        console.log(error);
        return [];
      });
    return balances;
  }
  async function get_isolated_margin() {
    const balances = await client
      .isolatedMarginAccountInfo()
      .then((response) => {
        if (response.statusText !== 200 && response.data.assets) {
          return response.data.assets;
        } else throw Error("Error isolated margin binance API");
      })
      .then((balances) => {
        var _balances = [];
        for (const b of balances.filter(
          (b) => b.baseAsset.totalAsset > 0 || b.quoteAsset.totalAsset > 0
        )) {
          const base_amount =
            parseFloat(b.baseAsset.free) +
            parseFloat(b.baseAsset.locked) -
            parseFloat(b.baseAsset.interest) -
            parseFloat(b.baseAsset.borrowed);
          const quote_amount =
            parseFloat(b.quoteAsset.free) +
            parseFloat(b.quoteAsset.locked) -
            parseFloat(b.quoteAsset.interest) -
            parseFloat(b.quoteAsset.borrowed);
          if (base_amount > 0) {
            merge_balances(
              { asset: b.baseAsset.asset, amount: base_amount },
              _balances
            );
          }
          if (quote_amount > 0) {
            merge_balances(
              { asset: b.quoteAsset.asset, amount: quote_amount },
              _balances
            );
          }
        }
        return _balances;
      })
      .catch((error) => {
        console.log(error);
        return [];
      });
    return balances;
  }
  const spot = await get_spot();
  const margin = await get_margin();
  const isolated_margin = await get_isolated_margin();
  return {
    cex: "Binance",
    balances: merge_lists([spot, margin, isolated_margin]),
  };
}
async function get_ftx(cex) {
  const API_key = decrypt(cex.api_key);
  const API_secret = decrypt(cex.api_secret);

  class FTXRest {
    constructor(key, secret) {
      this.key = key;
      this.secret = secret;
    }
    request(path) {
      const start = +new Date();
      const signature_payload = start + "GET" + "/api" + path;
      var signature = crypto
        .createHmac("sha256", this.secret)
        .update(signature_payload)
        .digest("hex");
      return axios.get("https://ftx.com/api" + path, {
        headers: {
          "FTX-KEY": this.key,
          "FTX-TS": start,
          "FTX-SIGN": signature,
        },
      });
    }
    async get_balances() {
      return await this.request("/wallet/balances")
        .then((response) => {
          if (response.data.success && response.data.result) {
            return response.data.result;
          }
          throw Error("Error ftx API");
        })
        .then((balances) => {
          let _balances = [];
          for (const b of balances.filter(
            (b) => b.usdValue > 0.1 && b.total > 0
          )) {
            _balances.push({ asset: b.coin, amount: parseFloat(b.total) });
          }
          return _balances;
        })
        .catch((error) => {
          console.log(error);
          return [];
        });
    }
  }
  const ftx = new FTXRest((key = API_key), (secret = API_secret));

  return { cex: "FTX", balances: await ftx.get_balances() };
}
async function get_kucoin(cex) {
  const API_key = decrypt(cex.api_key);
  const API_secret = decrypt(cex.api_secret);
  const API_passphrase = decrypt(cex.api_passphrase);

  class KCRest {
    constructor(key, secret, passphrase) {
      this.key = key;
      this.secret = secret;
      this.passphrase = crypto
        .createHmac("sha256", this.secret)
        .update(passphrase)
        .digest("base64");
      this.version = "2";
    }
    request(path) {
      const timestamp = +new Date();
      const signature_payload = timestamp + "GET" + "/api" + path;
      var signature = crypto
        .createHmac("sha256", this.secret)
        .update(signature_payload)
        .digest("base64");
      return axios.get("https://api.kucoin.com/api" + path, {
        headers: {
          "KC-API-KEY": this.key,
          "KC-API-TIMESTAMP": timestamp,
          "KC-API-SIGN": signature,
          "KC-API-PASSPHRASE": this.passphrase,
          "KC-API-KEY-VERSION": this.version,
        },
      });
    }
    async get_balance() {
      return await this.request("/v1/accounts")
        .then((response) => {
          if (response.data.code === "200000" && response.data.data) {
            return response.data.data;
          }
          throw Error("Error kc API");
        })
        .then((balances) => {
          let _balances = [];
          for (const b of balances.filter((b) => b.balance > 0)) {
            _balances.push({
              asset: b.currency,
              amount: parseFloat(b.balance),
            });
          }
          return _balances;
        })
        .catch((error) => {
          console.log(error);
          return [];
        });
    }
    async get_liabilities() {
      return await this.request("/v1/margin/borrow/outstanding")
        .then((response) => {
          if (response.data.code === "200000" && response.data.data) {
            return response.data.data.items;
          }
          throw Error("Error kc API");
        })
        .then((balances) => {
          let _balances = [];
          for (const b of balances) {
            _balances.push({
              asset: b.currency,
              amount: -parseFloat(b.liability),
            });
          }
          return _balances;
        });
    }
  }
  const kc = new KCRest(
    (key = API_key),
    (secret = API_secret),
    (passphrase = API_passphrase)
  );
  return {
    cex: "KuCoin",
    balances: merge_lists(
      await Promise.all([kc.get_balance(), kc.get_liabilities()])
    ),
  };
}
async function get_jm(cex) {
  const API_key = decrypt(cex.api_key);
  class JustMiningRest {
    constructor(API_key) {
      this.key = API_key;
    }
    async get_masternodes() {
      return await axios
        .get("https://api.just-mining.com/v1/masternodes", {
          headers: {
            "API-KEY": this.key,
          },
        })
        .then((response) => {
          if (response.data.success && response.data.data) {
            return response.data.data;
          }
          throw Error("Error jm API");
        })
        .then((balances) => {
          var _balances = [];
          for (const b of balances) {
            merge_balances(
              {
                asset: b.currencyCode,
                amount: parseFloat(b.collateral) + parseFloat(b.reward),
              },
              _balances
            );
          }
          return _balances;
        })
        .catch((error) => {
          console.log(error);
          return [];
        });
    }
  }
  jm = new JustMiningRest(API_key);
  return { cex: "JustMining", balances: await jm.get_masternodes() };
}

module.exports = { get_all_balance_cefi };
