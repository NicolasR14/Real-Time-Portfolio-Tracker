import React, { useState, useEffect } from "react";
import axios from "axios";
import Add_Item from "./Add_Item";
import Del_Item from "./Del_Item";

const select_names = [
  ["", "Choose Cex/Chain"],
  ["binance", "Binance"],
  ["ftx", "FTX"],
  ["kucoin", "Kucoin"],
  ["jm", "Just Mining"],
  ["avalanche", "Snowtrace"],
  ["arbitrum", "Arbiscan"],
  ["bsc", "BSCscan"],
  ["polygon", "PolygonScan"],
];

function API_key() {
  const [inputName, setNameValue] = useState("");
  const [inputKey, setKeyValue] = useState("");
  const [inputSecret, setSecretValue] = useState("");
  const [inputPassphrase, setPassphraseValue] = useState("");
  const [inputAPI_keys, setAPI_keysValue] = useState([]);

  function resetValues() {
    setKeyValue("");
    setSecretValue("");
    setPassphraseValue("");
  }

  async function setAPI_key() {
    const API_key = {
      name: inputName,
      api_key: inputKey,
    };
    if (inputPassphrase !== "") {
      API_key.api_passphrase = inputPassphrase;
    }
    if (inputSecret !== "") {
      API_key.api_secret = inputSecret;
    }
    return await axios
      .post("http://localhost:3000/api/api_keys", API_key)
      .then(() => {
        resetValues();
        getAPI_keys();
      })
      .catch((err) => {
        return err.response;
      });
  }

  async function getAPI_keys() {
    axios.get("http://localhost:3000/api/api_keys").then((api_keys) => {
      setAPI_keysValue(api_keys.data);
    });
  }

  async function delAPI_key(_id) {
    axios.delete("http://localhost:3000/api/api_keys/" + _id).then((res) => {
      console.log(res.status);
      getAPI_keys();
    });
  }

  useEffect(() => {
    getAPI_keys();
  }, []);

  return (
    <div className="settings-content">
      {inputAPI_keys.length !== 0 && (
        <table>
          <thead>
            <tr>
              <th width="15%">Name</th>
              <th width="35%">Key</th>
              <th width="35%">Secret</th>
              <th width="15%">Passphrase</th>
              <th width="10%"></th>
            </tr>
          </thead>
          <tbody>
            {inputAPI_keys.map((api_key) => {
              return (
                <tr key={api_key._id}>
                  <td>{api_key.name}</td>
                  <td>{api_key.api_key}</td>
                  <td>{api_key.api_secret}</td>
                  <td>{api_key.api_passphrase}</td>
                  <Del_Item _id={api_key._id} delFct={delAPI_key} />
                </tr>
              );
            })}
            <Add_Item
              items={[
                {
                  fct: setNameValue,
                  type: "select",
                  list: select_names,
                },
                { fct: setKeyValue, type: "input" },
                { fct: setSecretValue, type: "input" },
                { fct: setPassphraseValue, type: "input" },
              ]}
              addFct={setAPI_key}
              targets={[]}
            />
          </tbody>
        </table>
      )}
    </div>
  );
}
export default API_key;
