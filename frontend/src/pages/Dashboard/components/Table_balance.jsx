import React from "react";

export default function BalanceTable({ balances }) {
  return (
    <table style={{ height: "100%" }}>
      <thead style={{ fontSize: "25px" }}>
        <tr>
          <th style={{ width: "45%" }}>Asset</th>
          <th style={{ width: "30%" }}>Amount</th>
          <th style={{ width: "25%", textAlign: "right" }}>Value</th>
        </tr>
      </thead>
      <tbody style={{ fontSize: "20px" }}>
        {balances.map((balance) => {
          return (
            <tr key={balance.asset}>
              <th>{balance.asset}</th>
              <td>{balance.amount}</td>
              <td style={{ textAlign: "right" }}>{balance.usd_value}$</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
