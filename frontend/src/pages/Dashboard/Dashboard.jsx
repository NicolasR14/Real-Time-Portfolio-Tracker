import React, { useState, useEffect } from "react";
import "../../styles/Dashboard.css";
import CircleLoader from "./components/CircleLoader";
import HistChart from "./components/Hist_chart";
import CompoChart from "./components/CompoChart";
import Table_balance from "./components/Table_balance";
import Total_balance from "./components/Total_balance";
import Select from "./components/Select_bar";
import axios from "axios";

function Balances() {
  let [status, setStatus] = useState(0);
  let [total, setTotalValue] = useState(0);
  let [balances, setBalances] = useState([]);
  let [composition, setComposition] = useState([]);
  let [evolution, setEvolution] = useState(0);
  let [debt, setDebt] = useState([]);
  let [histo, setHisto] = useState([]);
  let [select_currency, setCurrency] = useState(0);
  let [invest, setInvest] = useState("crypto");

  function getBalance() {
    axios.get("http://localhost:3000/api/balance").then((response) => {
      console.log(response);
      setTotalValue(response.data.crypto.total);
      setBalances(response.data.crypto.balances);
      setEvolution(response.data.crypto.evolution);
      setComposition(response.data.crypto.composition);
      setDebt(response.data.crypto.debt);
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
    <span>
      {status === 0 ? (
        <div className="circle">
          <CircleLoader />
        </div>
      ) : (
        <div className="Dashboard">
          <div className="balance">
            <Table_balance balances={balances} />
          </div>
          <CompoChart series={composition} cSize="100%" />
          <CompoChart series={debt} cSize="70%" />
          <div className="total_usd">
            <Total_balance
              balance_total={total}
              histo={histo}
              select_value={select_currency}
              evolution={evolution}
            />
          </div>
          <div className="hist">
            <HistChart histo={histo} select_value={select_currency} />
          </div>
          <div className="select_slide">
            <Select
              selFct={setCurrency}
              values={[
                { value: "usd", value2: "$" },
                { value: "eur", value2: "€" },
                { value: "eth", value2: "ETH" },
                { value: "btc", value2: "BTC" },
                { value: "***", value2: "***" },
              ]}
            />
            <Select
              selFct={setInvest}
              values={[
                { value: "crypto", value2: "Crypto" },
                { value: "pea", value2: "PEA" },
                { value: "pel", value2: "PEL" },
                { value: "total", value2: "Total" },
              ]}
            />
          </div>
        </div>
      )}
    </span>
  );
}
export default Balances;
