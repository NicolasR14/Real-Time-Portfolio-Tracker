import React, { useState, useEffect } from "react";
import Progress_bar from "./Progress_bar";
export default function BalanceTable({
  balance_total,
  histo,
  select_value,
  evolution,
}) {
  let [total, setTotal] = useState("");
  let [progress, setProgress] = useState(
    (balance_total.usd / Math.max(...histo.map((h) => h.balance))) * 100
  );
  let [evol, setEvol] = useState("");

  function get_style_evol() {
    if (evolution.usd < 0) {
      return { color: "red" };
    }
    return { color: "green" };
  }

  function get_infos() {
    setEvol(evolution.usd.toFixed(2) + "%");
    console.log(progress);
    switch (select_value) {
      case "eur":
        setTotal(balance_total.eur + " €");
        setProgress(
          (balance_total.eur / Math.max(...histo.map((h) => h.balance_eur))) *
            100
        );
        return;
      case "eth":
        setTotal(balance_total.eth + " $ETH");
        setProgress(
          (balance_total.eth / Math.max(...histo.map((h) => h.balance_eth))) *
            100
        );
        return;
      case "btc":
        setTotal(balance_total.btc + " $BTC");
        setProgress(
          (balance_total.btc / Math.max(...histo.map((h) => h.balance_btc))) *
            100
        );
        return;
      case "***":
        setTotal("***");
        setProgress(
          (balance_total.usd / Math.max(...histo.map((h) => h.balance))) * 100
        );
        return;
      default:
        setTotal(balance_total.usd + " $");
        setProgress(
          (balance_total.usd / Math.max(...histo.map((h) => h.balance))) * 100
        );
        return;
    }
  }

  useEffect(() => {
    get_infos();
  }, [balance_total, histo, select_value]);
  return (
    <span>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ fontSize: "30px" }}>Total : {total}</div>
        <div style={get_style_evol()}>{evol}</div>
      </div>

      <Progress_bar bgcolor="#0099ff" progress={progress} height={"50%"} />
    </span>
  );
}
