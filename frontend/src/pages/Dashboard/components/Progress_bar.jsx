import React from "react";
const Progress_bar = ({ bgcolor, progress, height }) => {
  const Parentdiv = {
    height: height,
    width: "100%",
    backgroundColor: "whitesmoke",
    borderRadius: 10,
  };

  const Childdiv = {
    height: "100%",
    width: `${progress}%`,
    backgroundColor: bgcolor,
    borderRadius: 10,
  };

  function get_text() {
    return progress === 100
      ? "Wallet ATH!"
      : String(Math.round((progress / 100 - 1) * 100)) + "% from wallet ATH";
  }

  return (
    <div className="progress_bar">
      <div style={Parentdiv}>
        <div style={Childdiv}></div>
      </div>
      <span
        style={{
          fontSize: "1.28vw",
          textAlign: "end",
          marginBottom: "4px",
        }}
      >{`${get_text()}`}</span>
    </div>
  );
};

export default Progress_bar;
