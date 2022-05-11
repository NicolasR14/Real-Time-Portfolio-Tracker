import React from "react";
import Collapsible from "react-collapsible";
import { BsChevronDown } from "react-icons/bs"; //react-icon
import "../../styles/Collapsible.css";

const Collaps = ({ trigger, content }) => {
  return (
    <Collapsible trigger={[trigger, <BsChevronDown />]}>{content}</Collapsible>
  );
};

export default Collaps;
