import React, { useState, useEffect } from "react";
import Progress_bar from "./Progress_bar";
export default function BalanceTable({ balance_total, histo, select_value }) {
  let ath_wallet = Math.max(...histo.map((h) => h.balance));
  let ath_wallet_eur = Math.max(...histo.map((h) => h.balance_eur));
  let ath_wallet_eth = Math.max(...histo.map((h) => h.balance_eth));
  let ath_wallet_btc = Math.max(...histo.map((h) => h.balance_btc));

  function get_balance_total() {
    switch (select_value) {
      case "eur":
        return balance_total.eur + " €";
      case "eth":
        return balance_total.eth + " $ETH";
      case "btc":
        return balance_total.btc + " $BTC";
      case "***":
        return "***";
      default:
        return balance_total.usd + " $";
    }
  }

  function get_progress() {
    switch (select_value) {
      case "eur":
        return (balance_total.eur / ath_wallet_eur) * 100;
      case "eth":
        return (balance_total.eth / ath_wallet_eth) * 100;
      case "btc":
        return (balance_total.btc / ath_wallet_btc) * 100;
      default:
        return (balance_total.usd / ath_wallet) * 100;
    }
  }

  return (
    <span>
      <div style={{ fontSize: "30px" }}>Total : {get_balance_total()}</div>
      <Progress_bar
        bgcolor="#0099ff"
        progress={get_progress()}
        height={"50%"}
      />
    </span>
  );
}
