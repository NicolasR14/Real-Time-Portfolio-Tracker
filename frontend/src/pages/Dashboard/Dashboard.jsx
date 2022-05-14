import React, { useState, useEffect } from "react";
import "../../styles/Dashboard.css";
import CircleLoader from "./components/CircleLoader";
import HistChart from "./components/Hist_chart";
import Table_balance from "./components/Table_balance";
import Total_balance from "./components/Total_balance";
import axios from "axios";

function Balances() {
  let [status, setStatus] = useState(0);
  let [inputTotalUsd, setTotalUsdValue] = useState(0);
  let [balances, setBalances] = useState([]);
  let [histo, setHisto] = useState([]);

  function getBalance() {
    axios.get("http://localhost:3000/api/balance").then((response) => {
      setTotalUsdValue(response.data.total_usd);
      setBalances(response.data.balances);
      axios.get("http://localhost:3000/api/histo").then((hist) => {
        setHisto(hist.data);
      });
      setStatus(1);
    });
  }

  useEffect(() => {
    getBalance();
  }, []);

  return (
    <div className="Dashboard">
      {status === 0 && (
        <div className="circle">
          <CircleLoader />
        </div>
      )}
      {status === 1 && (
        <div className="balance">
          <Table_balance balances={balances} />
        </div>
      )}
      {status === 1 && (
        <div className="total_usd">
          <Total_balance balance_total={inputTotalUsd} histo={histo} />
        </div>
      )}
      {status === 1 && (
        <div className="hist">
          <HistChart histo={histo} />
        </div>
      )}
    </div>
  );
}
export default Balances;
