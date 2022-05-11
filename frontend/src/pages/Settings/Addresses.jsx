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

function Addresses() {
  const [inputChain, setChainValue] = useState("");
  const [inputAddress, setAddressValue] = useState("");
  const [inputAddresses, setAddressesValue] = useState([]);

  async function setAddress() {
    const address = {
      chain: inputChain,
      address: inputAddress,
    };
    return await axios
      .post("http://localhost:3000/api/addresses", address)
      .then(() => {
        getAddresses();
      })
      .catch((err) => {
        return err.response;
      });
  }

  async function getAddresses() {
    axios.get("http://localhost:3000/api/addresses").then((addresses) => {
      setAddressesValue(addresses.data);
    });
  }

  async function delAddress(_id) {
    axios.delete("http://localhost:3000/api/addresses/" + _id).then((res) => {
      console.log(res.status);
      getAddresses();
    });
  }

  useEffect(() => {
    getAddresses();
  }, []);
  return (
    <div className="settings-content">
      {inputAddresses.length !== 0 && (
        <table>
          <thead>
            <tr>
              <th width="45%">Chain</th>
              <th width="45%">Address</th>
              <th width="10%"></th>
            </tr>
          </thead>
          <tbody>
            {inputAddresses.map((address) => {
              return (
                <tr key={address._id}>
                  <td>{address.chain}</td>
                  <td>{address.address}</td>
                  <Del_Item _id={address._id} delFct={delAddress} />
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
              ]}
              addFct={setAddress}
              targets={[inputChain, inputAddress]}
            />
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Addresses;
