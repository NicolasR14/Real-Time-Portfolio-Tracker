import React from "react";

export default function BalanceTable(balances) {
  return (
    <table className="balance_table">
      <thead className="balance_t_h">
        <tr>
          <th>Asset</th>
          <th>Amount</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
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
