import React from "react";
import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="App-header">
      <li>
        <Link to="/">Dashboard</Link>
      </li>
      <li>
        <Link to="/settings">Settings</Link>
      </li>
    </nav>
  );
};
export default Navbar;
