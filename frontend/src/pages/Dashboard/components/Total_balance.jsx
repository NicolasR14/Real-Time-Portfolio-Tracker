import React from "react";
import Progress_bar from "./Progress_bar";
export default function BalanceTable(balance_total, histo) {
  const ath_wallet = Math.max(...histo.map((h) => h.balance));
  const progress = (balance_total / ath_wallet) * 100;
  return (
    <div className="balance_total">
      <div>Total USD : {balance_total}$</div>
      <Progress_bar bgcolor="#0099ff" progress={progress} height={15} />
    </div>
  );
}