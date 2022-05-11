import React, { useState } from "react";
import axios from "axios";
import API_key from "./API_key";
import Addresses from "./Addresses";
import Collaps from "./Collapsible";
import Contracts from "./Contracts";
import Tickers from "./Tickers";
import ManBalance from "./Manual_balance";
import "../../styles/Settings.css";
function Settings() {
  return (
    <div className="settings">
      <Collaps trigger="Manual balances" content={<ManBalance />} />
      <Collaps trigger="Addresses" content={<Addresses />} />
      <Collaps trigger="Contracts" content={<Contracts />} />
      <Collaps trigger="API keys" content={<API_key />} />
      <Collaps trigger="Tickers" content={<Tickers />} />
    </div>
  );
}
export default Settings;
