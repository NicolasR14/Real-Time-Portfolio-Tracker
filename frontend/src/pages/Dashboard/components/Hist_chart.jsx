import React, { Component } from "react";
import Chart from "react-apexcharts";

function HistChart({ histo, select_value }) {
  function get_data_value() {
    switch (select_value) {
      case 0:
        return {
          name: "USD value",
          data: histo.map((h) => h.balance),
        };
      case 1:
        return {
          name: "EUR value",
          data: histo.map((h) => h.balance_eur),
        };
      case 2:
        return {
          name: "ETH value",
          data: histo.map((h) => h.balance_eth),
        };
      case 3:
        return {
          name: "BTC value",
          data: histo.map((h) => h.balance_btc),
        };
    }
  }

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
          formatter: (value) => {
            return value.toFixed(2);
          },
        },
      },
      stroke: {
        curve: "smooth",
        width: 4,
      },
    },
  };
  return (
    <Chart
      options={state.options}
      series={[get_data_value()]}
      type="line"
      height="100%"
      width="100%"
    />
  );
}

export default HistChart;
