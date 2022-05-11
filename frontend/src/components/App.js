import "../styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Settings from "../pages/Settings/Settings";

import Navbar from "./NavBar";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <div className="Content">
          <Routes>
            <Route path="/" exact element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
