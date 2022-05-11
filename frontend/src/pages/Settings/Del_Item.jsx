import React, { useState, useEffect } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri"; //react-icon

function Del_Item({ _id, delFct }) {
  return (
    <td align="right">
      <button
        className="button"
        onClick={() => {
          delFct(_id);
        }}
      >
        <RiDeleteBin2Fill color={"#c70039"} size={25} />
      </button>
    </td>
  );
}

export default Del_Item;
