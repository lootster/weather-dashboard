import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  labels: string[];
  maxTemp: number[];
  minTemp: number[];
};

const TemperatureLineChart: React.FC<Props> = ({
  labels,
  maxTemp,
  minTemp,
}) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Max Temperature (°C)",
        data: maxTemp,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Min Temperature (°C)",
        data: minTemp,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default TemperatureLineChart;
