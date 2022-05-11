import React, { useState, useEffect } from "react";
import { FcPlus } from "react-icons/fc"; //react-icon

function Add_Item({ items, addFct, targets }) {
  function getClassButton() {
    for (const t of targets) {
      if (t === "") {
        return "button disabled";
      }
    }
    return "button";
  }
  return (
    <tr key="addItem">
      {items.map((item, i) => {
        return (
          <td key={i}>
            {item.type === "input" && (
              <input
                type="text"
                onChange={(e) => item.fct(e.target.value)}
              ></input>
            )}
            {item.type === "select" && (
              <select
                onChange={(e) => {
                  item.fct(e.target.value);
                }}
              >
                {item.list.map((o) => {
                  return <option value={o[0]}>{o[1]}</option>;
                })}
              </select>
            )}
          </td>
        );
      })}
      <td align="right">
        <button
          className={getClassButton()}
          onClick={() => {
            addFct();
          }}
        >
          <FcPlus size={25} />
        </button>
      </td>
    </tr>
  );
}

export default Add_Item;
