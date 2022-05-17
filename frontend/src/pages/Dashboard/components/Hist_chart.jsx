import React, { Component } from "react";
import Chart from "react-apexcharts";

function HistChart({ histo }) {
  const state = {
    options: {
      colors: ["#0099ff"],
      chart: {
        foreColor: "white",
        toolbar: {
          show: true,

          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true | '<img src="/static/icons/reset.png" width="20">',
            customIcons: [],
          },
        },
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
        padding: {
          left: 0,
          right: 0,
        },
      },

      xaxis: {
        categories: histo.map((h) => new Date(h.day).getTime()),
        type: "datetime",
      },

      yaxis: {
        labels: {
          offsetX: -20,
        },
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
    <Chart
      options={state.options}
      series={state.series}
      type="line"
      height="100%"
      width="100%"
    />
  );
}

export default HistChart;
