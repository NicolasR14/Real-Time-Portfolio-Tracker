import React, { useState, useEffect } from "react";
import axios from "axios";
import Add_Item from "./Add_Item";
import Del_Item from "./Del_Item";

const select_chains = [
  ["", "Select chain"],
  ["arbitrum", "Arbitrum"],
  ["avalanche", "Avalanche"],
  ["bsc", "BSC"],
  ["fantom", "Fantom"],
  ["polygon", "Polygon"],
  ["solana", "Solana"],
];

function Tickers() {
  const [inputName, setNameValue] = useState("");
  const [inputTicker, setTickerValue] = useState("");
  const [inputTickers, setTickersValue] = useState([]);
  async function setTicker() {
    const ticker = {
      name: inputName,
      ticker: inputTicker,
    };
    return await axios
      .post("http://localhost:3000/api/tickers", ticker)
      .then(() => getTickers())
      .catch((err) => {
        return err.response;
      });
  }
  async function getTickers() {
    axios.get("http://localhost:3000/api/tickers").then((tickers) => {
      setTickersValue(tickers.data);
    });
  }

  async function delTicker(_id) {
    axios.delete("http://localhost:3000/api/tickers/" + _id).then((res) => {
      console.log(res.status);
      getTickers();
    });
  }

  useEffect(() => {
    getTickers();
  }, []);
  return (
    <div className="settings-content">
      {inputTickers.length !== 0 && (
        <table>
          <thead>
            <tr>
              <th width="45%">Name</th>
              <th width="45%">Ticker</th>
              <th width="10%"></th>
            </tr>
          </thead>
          <tbody>
            {inputTickers.map((ticker) => {
              return (
                <tr key={ticker._id}>
                  <td>{ticker.name}</td>
                  <td>{ticker.ticker}</td>
                  <Del_Item _id={ticker._id} delFct={delTicker} />
                </tr>
              );
            })}
            <Add_Item
              items={[
                { fct: setNameValue, type: "input" },
                {
                  fct: setTickerValue,
                  type: "input",
                },
              ]}
              addFct={setTicker}
              targets={[inputName, inputTicker]}
            />
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Tickers;
