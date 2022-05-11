import React, { Component } from "react";
import Chart from "react-apexcharts";

function HistChart(histo) {
  const state = {
    options: {
      colors: ["#0099ff"],
      chart: {
        foreColor: "white",
      },
      grid: {
        show: true,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },

      xaxis: {
        categories: histo.map((h) => new Date(h.day).getTime()),
        type: "datetime",
      },
      stroke: {
        curve: "smooth",
        width: 4,
      },
    },
    series: [
      {
        name: "Wallet value",
        data: histo.map((h) => h.balance),
      },
    ],
  };
  return (
    <div className="hist_chart">
      <div className="row">
        <div className="mixed-chart">
          <Chart
            options={state.options}
            series={state.series}
            type="line"
            width="550"
          />
        </div>
      </div>
    </div>
  );
}

export default HistChart;
