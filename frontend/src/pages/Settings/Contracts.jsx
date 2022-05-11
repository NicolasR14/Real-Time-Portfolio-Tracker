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

function Contracts() {
  const [inputChain, setChainValue] = useState("");
  const [inputAddress, setAddressValue] = useState("");
  const [inputContracts, setContractsValue] = useState([]);
  const [inputType, setTypeValue] = useState("");
  const [inputName, setNameValue] = useState("");
  const [inputDecimals, setDecimalsValue] = useState("");

  async function setContract() {
    const contract = {
      chain: inputChain,
      address: inputAddress,
      type: inputType,
      name: inputName,
      decimals: inputDecimals,
    };
    return await axios
      .post("http://localhost:3000/api/contracts", contract)
      .then(() => getContracts());
  }

  async function getContracts() {
    axios.get("http://localhost:3000/api/contracts").then((contracts) => {
      setContractsValue(contracts.data);
    });
  }

  async function delContract(_id) {
    axios.delete("http://localhost:3000/api/contracts/" + _id).then((res) => {
      console.log(res.status);
      getContracts();
    });
  }

  useEffect(() => {
    getContracts();
  }, []);
  return (
    <div className="settings-content">
      {inputContracts.length !== 0 && (
        <table>
          <thead>
            <tr>
              <th width="12.5%">Chain</th>
              <th width="40%">Address</th>
              <th width="12.5%">Type</th>
              <th width="12.5%">Name</th>
              <th width="12.5%">Decimals</th>
              <th width="10%"></th>
            </tr>
          </thead>
          <tbody>
            {inputContracts.map((contract) => {
              return (
                <tr key={contract._id}>
                  <td>{contract.chain}</td>
                  <td>{contract.address}</td>
                  <td>{contract.type}</td>
                  <td>{contract.name}</td>
                  <td>{contract.decimals}</td>
                  <Del_Item _id={contract._id} delFct={delContract} />
                </tr>
              );
            })}
            <Add_Item
              items={[
                {
                  fct: setChainValue,
                  type: "select",
                  list: select_chains,
                },
                { fct: setAddressValue, type: "input" },
                {
                  fct: setTypeValue,
                  type: "select",
                  list: [
                    ["", "Select type"],
                    ["token", "Token"],
                    ["lp", "Liquidity Pool"],
                  ],
                },
                { fct: setNameValue, type: "input" },
                { fct: setDecimalsValue, type: "input" },
              ]}
              addFct={setContract}
              targets={[
                inputChain,
                inputAddress,
                inputContracts,
                inputType,
                inputName,
                inputDecimals,
              ]}
            />
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Contracts;
