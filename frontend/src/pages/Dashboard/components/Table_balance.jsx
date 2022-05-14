import React from "react";

export default function BalanceTable({ balances }) {
  return (
    <table style={{ height: "100%" }}>
      <thead style={{ fontSize: "1.8vw" }}>
        <tr>
          <th>Asset</th>
          <th>Amount</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody style={{ fontSize: "1.25vw" }}>
        {balances.map((balance) => {
          return (
            <tr key={balance.asset}>
              <th>{balance.asset}</th>
              <td>{balance.amount}</td>
              <td>{balance.usd_value}$</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
