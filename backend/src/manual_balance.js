const Manual_balance = require("../models/Manual_balance");
const ManBal = require("../models/Manual_balance");
const { merge_balances } = require("./common_functions");

async function get_man_balance() {
  return await ManBal.find().then((balances) => {
    _balances = [];
    for (const b of balances) {
      merge_balances(b, _balances);
    }

    return {
      type: "Manual balance",
      balances: _balances,
    };
  });
}
module.exports = { get_man_balance };
