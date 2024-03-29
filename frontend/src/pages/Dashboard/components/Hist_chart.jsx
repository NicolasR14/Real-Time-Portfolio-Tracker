import React, { Component } from "react";
import Chart from "react-apexcharts";
import "../../../styles/Hist.css";

function HistChart({ histo, select_value }) {
  function get_data_value() {
    switch (select_value) {
      case "eur":
        return {
          name: "EUR value",
          data: histo.map((h) => h.balance_eur),
        };
      case "eth":
        return {
          name: "ETH value",
          data: histo.map((h) => h.balance_eth),
        };
      case "btc":
        return {
          name: "BTC value",
          data: histo.map((h) => h.balance_btc),
        };
      default:
        return {
          name: "USD value",
          data: histo.map((h) => h.balance),
        };
    }
  }

  const state = {
    options: {
      tooltip: {
        enabled: true,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          return (
            '<div class="arrow_box">' +
            "<span>" +
            series[seriesIndex][dataPointIndex] +
            "</span>" +
            "</div>"
          );
        },
      },
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
