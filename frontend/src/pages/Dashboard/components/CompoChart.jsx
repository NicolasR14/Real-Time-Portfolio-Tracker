import { flexbox } from "@mui/system";
import React, { useState, ComponentProps } from "react";
import { PieChart } from "react-minimal-pie-chart";

function CompoChart({ series, cSize }) {
  const COLORS = [
    "#2A8FF7",
    "#68E497",
    "#F6B042",
    "#ED415E",
    "#775DD0",
    "#F17CB0",
    "#2EBFBC",
    "#3BB086",
    "#cbde1d",
    "#1dde81",
    "#debb1d",
    "#2A8FF7",
    "#68E497",
    "#F6B042",
    "#ED415E",
    "#775DD0",
    "#F17CB0",
    "#2EBFBC",
    "#3BB086",
    "#cbde1d",
    "#1dde81",
    "#debb1d",
  ];
  const [hovered, setHovered] = useState(undefined);
  const [percentageSelected, setPercentageSelect] = useState("");
  const [assetSelected, setAssetSelect] = useState("");

  let i = -1;
  const data = series.map((a) => {
    i++;
    let color = COLORS[i];
    if (hovered === i) {
      color = "white";
    }
    return { title: a.asset, value: a.percentage, color: color };
  });

  const defaultLabelStyle = {
    fontSize: "5px",
    fontFamily: "sans-serif",
  };

  return (
    <div className="compo" style={{ height: cSize, width: cSize }}>
      <div style={{ width: "100%", height: "100%" }}>
        <PieChart
          data={data}
          // label={({ x, y, dx, dy, dataEntry }) => (
          //   <text
          //     x={x}
          //     y={y}
          //     dx={dx}
          //     dy={dy}
          //     dominant-baseline="central"
          //     textAnchor="middle"
          //     style={{
          //       fill: "#ffffff",
          //       fontSize: "5px",
          //       fontFamily: "sans-serif",
          //     }}
          //   >
          //     {dataEntry.title}
          //   </text>
          // )}
          labelStyle={defaultLabelStyle}
          labelPosition={68}
          lineWidth={15}
          // paddingAngle={15}
          startAngle={-90}
          // rounded
          onMouseOver={(_, index) => {
            setPercentageSelect(Math.round(data[index].value * 100) + "%");
            setAssetSelect(data[index].title);
            setHovered(index);
          }}
          onMouseOut={() => {
            setHovered(undefined);
            setPercentageSelect("");
            setAssetSelect("");
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>{percentageSelected}</div>
        <div>{assetSelected}</div>
      </div>
    </div>
  );
}

export default CompoChart;
