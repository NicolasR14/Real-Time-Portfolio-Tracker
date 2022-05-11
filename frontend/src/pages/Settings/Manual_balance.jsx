import React, { useState, useEffect } from "react";
import axios from "axios";
import Add_Item from "./Add_Item";
import Del_Item from "./Del_Item";

function Man_balance() {
  const [inputType, setTypeValue] = useState("");
  const [inputAsset, setAssetValue] = useState("");
  const [inputAmount, setAmountValue] = useState("");
  const [inputManBalances, setManBalancesValue] = useState([]);

  async function setBalance() {
    const man_balance = {
      type: inputType,
      asset: inputAsset,
      amount: inputAmount,
    };
    console.log(man_balance);
    return await axios
      .post("http://localhost:3000/api/man_bal", man_balance)
      .then(() => {
        getBalance();
      })
      .catch((err) => {
        return err.response;
      });
  }

  async function getBalance() {
    axios.get("http://localhost:3000/api/man_bal").then((balances) => {
      setManBalancesValue(balances.data);
    });
  }

  async function delBalance(_id) {
    axios.delete("http://localhost:3000/api/man_bal/" + _id).then((res) => {
      console.log(res.status);
      getBalance();
    });
  }

  useEffect(() => {
    getBalance();
  }, []);
  return (
    <div className="settings-content">
      {inputManBalances.length !== 0 && (
        <table>
          <thead>
            <tr>
              <th width="30%">Type</th>
              <th width="30%">Asset</th>
              <th width="30%">Amount</th>
              <th width="10%"></th>
            </tr>
          </thead>
          <tbody>
            {inputManBalances.map((balance) => {
              return (
                <tr key={balance._id}>
                  <td>{balance.type}</td>
                  <td>{balance.asset}</td>
                  <td>{balance.amount}</td>
                  <Del_Item _id={balance._id} delFct={delBalance} />
                </tr>
              );
            })}
            <Add_Item
              items={[
                { fct: setTypeValue, type: "input" },
                { fct: setAssetValue, type: "input" },
                { fct: setAmountValue, type: "input" },
              ]}
              addFct={setBalance}
              targets={[inputType, inputAsset, inputAmount]}
            />
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Man_balance;
