const supported_chains = [
  "arbitrum",
  "avalanche",
  "bsc",
  "fantom",
  "polygon",
  "solana",
];
const axios = require("axios");
const Address = require("../../models/Address");
const API_key = require("../../models/API_key");
const Contract = require("../../models/Contract");
const { decrypt } = require("../src/crypt");
const { merge_balances, merge_lists } = require("../src/common_functions");
const { resolve } = require("mathjs");

const dict_bc = {
  bsc: {
    url_p1:
      "https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=",
    url_p2: "&address=",
    url_p3: "&tag=latest&apikey=",
    url_ct_p1:
      "https://api.bscscan.com/api?module=account&action=balance&address=",
    url_ct_p2: "&apikey=",
    chain_token: "BNB",
    ct_decimals: 18,
  },
  avalanche: {
    url_p1:
      "https://api.snowtrace.io/api?module=account&action=tokenbalance&contractaddress=",
    url_p2: "&address=",
    url_p3: "&tag=latest&apikey=",
    url_ct_p1:
      "https://api.snowtrace.io/api?module=account&action=balance&address=",
    url_ct_p2: "&tag=latest&apikey=",
    chain_token: "AVAX",
    ct_decimals: 18,
  },
  arbitrum: {
    url_p1:
      "https://api.arbiscan.io/api?module=account&action=tokenbalance&contractaddress=",
    url_p2: "&address=",
    url_p3: "&tag=latest&apikey=",
    url_ct_p1:
      "https://api.arbiscan.io/api?module=account&action=balance&address=",
    url_ct_p2: "&tag=latest&apikey=",
    chain_token: "ETH",
    ct_decimals: 18,
  },
  fantom: {
    url_p1:
      "https://api.ftmscan.com/api?module=account&action=tokenbalance&contractaddress=",
    url_p2: "&address=",
    url_p3: "&tag=latest&apikey=",
    url_ct_p1:
      "https://api.ftmscan.com/api?module=account&action=balance&address=",
    url_ct_p2: "&tag=latest&apikey=",
    chain_token: "FTM",
    ct_decimals: 18,
  },
  polygon: {
    url_p1:
      "https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=",
    url_p2: "&address=",
    url_p3: "&tag=latest&apikey=",
    url_ct_p1:
      "https://api.polygonscan.com/api?module=account&action=balance&address=",
    url_ct_p2: "&apikey=",
    chain_token: "MATIC",
    ct_decimals: 18,
  },
};

async function get_all_balance_defi() {
  return await Address.find().then(async (addresses) => {
    var balances_chain = [];
    await Promise.all(
      supported_chains.map(async (chain) => {
        const addresses_chain = addresses.filter((a) => a.chain === chain);
        for (const address of addresses_chain) {
          if (chain === "solana") {
            balances_chain.push(await get_solana_balance(address));
          } else {
            await Contract.find({ chain: chain }).then(async (contracts) => {
              balances_chain.push(await get_evm_balance(address, contracts));
            });
          }
        }
        resolve();
      })
    );
    return balances_chain;
  });
}

async function get_solana_balance(address) {
  //chain token
  const url_chain_token =
    "https://public-api.solscan.io/account/" + address.address;
  let balances = [];
  balances.push({
    asset: "SOL",
    amount: await axios
      .get(url_chain_token)
      .then((res) => {
        if (res.status !== 200) {
          throw Error("Error solana API request");
        }
        return res.data;
      })
      .then((data) => {
        return parseFloat(data.lamports) / 10 ** 9;
      }),
  });
  const url =
    "https://public-api.solscan.io/account/tokens?account=" + address.address;
  await axios
    .get(url)
    .then((res) => {
      if (res.status !== 200) {
        throw Error("Error solana API request");
      }
      return res.data;
    })
    .then((data) => {
      for (const a of data) {
        let amount = parseFloat(a.tokenAmount.amount) / 10 ** 9;
        if (amount > 0) {
          balances.push({
            asset: a.tokenSymbol,
            amount: amount,
          });
        }
      }
    });
  return {
    address: address.address,
    chain: address.chain,
    balances: balances,
  };
}

async function get_evm_balance(address, contracts) {
  const key = await API_key.findOne({ name: address.chain }).then((_key) => {
    if (!_key) {
      throw Error("Didn't find key for " + address.chain);
    }
    return decrypt(_key.api_key);
  });

  //Chain token balance
  const bc = dict_bc[address.chain];
  var balances = [];
  const url_chain_token = bc.url_ct_p1 + address.address + bc.url_ct_p2 + key;
  balances.push({
    asset: bc.chain_token,
    amount: await axios
      .get(url_chain_token)
      .then((res) => {
        if (res.data.status !== "1") {
          throw Error("Request error for chain token balance");
        }
        return res.data.result;
      })
      .then((res) => {
        return res / 10 ** bc.ct_decimals;
      }),
  });

  for (const c of contracts) {
    const url_token =
      bc.url_p1 + c.address + bc.url_p2 + address.address + bc.url_p3 + key;
    await new Promise((resolve) =>
      setTimeout(() => {
        axios
          .get(url_token)
          .then((res) => {
            if (res.data.status !== "1") {
              throw Error(
                "Request error for " + address.chain + " contract balance"
              );
            }
            return res.data.result;
          })
          .then((res) => {
            return res / 10 ** c.decimals;
          })
          .then((amount) => {
            if (amount > 0) {
              merge_balances({ asset: c.name, amount: amount }, balances);
            }
            resolve();
          });
      }, 200)
    );
  }

  return { address: address.address, chain: address.chain, balances: balances };
}

module.exports = { get_all_balance_defi };
