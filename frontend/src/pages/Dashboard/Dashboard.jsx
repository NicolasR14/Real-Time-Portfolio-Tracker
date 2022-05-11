import React, { useState } from "react";
import "../../styles/Balances.css";
import CircleLoader from "./components/CircleLoader";
import HistChart from "./components/Hist_chart";
import Table_balance from "./components/Table_balance";
import Total_balance from "./components/Total_balance";
import axios from "axios";

function Balances() {
  let [status, setStatus] = useState(0);
  let [balances, setBalances] = useState([]);
  let [histo, setHisto] = useState([]);

  function getBalance() {
    setStatus(2);
    axios.get("http://localhost:3000/api/balance").then((response) => {
      console.log(response);
      setBalances(response.data);
      axios.get("http://localhost:3000/api/histo").then((hist) => {
        setHisto(hist.data);
      });
      setStatus(1);
    });
  }
  function getClassButton() {
    return status === 0 || status === 1
      ? "getbalbtn btn btn-success"
      : "getbalbtn btn btn-secondary disabled";
  }
  return (
    <div className="Balances">
      {status === 0 && (
        <button className={getClassButton()} onClick={() => getBalance()}>
          Get Balance
        </button>
      )}
      {status === 1
        ? Table_balance(balances.merged_balance)
        : status === 2 && <CircleLoader />}
      {status === 1 && Total_balance(balances.total_usd, histo)}
      {status === 1 && HistChart(histo)}
    </div>
  );
}
export default Balances;
