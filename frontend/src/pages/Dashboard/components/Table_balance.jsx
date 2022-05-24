import React from "react";

export default function BalanceTable({ balances }) {
  function get_style_evol(balance) {
    if (
      (parseFloat(balance.evol) < 0 && balance.amount > 0) ||
      (balance.amount < 0 && parseFloat(balance.evol) > 0)
    ) {
      return { textAlign: "right", color: "red" };
    }
    return { textAlign: "right", color: "green" };
  }
  return (
    <table style={{ height: "100%" }}>
      <thead style={{ fontSize: "min(30px,1.6vw)" }}>
        <tr>
          <th style={{ width: "25%" }}>Asset</th>
          <th style={{ width: "20%" }}>Amount</th>
          <th style={{ width: "15%", textAlign: "right" }}>Value</th>
          <th style={{ width: "15%", textAlign: "right" }}></th>
        </tr>
      </thead>
      <tbody style={{ fontSize: "min(20px,1.2vw)" }}>
        {balances.map((balance) => {
          return (
            <tr key={balance.asset}>
              <th>{balance.asset}</th>
              <td>{balance.amount}</td>
              <td style={{ textAlign: "right" }}>{balance.usd_value}$</td>
              <td style={get_style_evol(balance)}>{balance.evol}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
