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
  Filler,
} from "chart.js";

// Register components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Props = {
  data: number[];
  labels: string[];
};

const AreaChart: React.FC<Props> = ({ data, labels }) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Direct Radiation (W/m²)",
        data: data,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        fill: true,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default AreaChart;
