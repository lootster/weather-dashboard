import React, { useEffect, useState } from "react";
import { getWeatherData } from "./services/weatherService";
import { format } from "date-fns";
import styles from "./App.module.css";
import ColumnChart from "./components/ColumnChart";
import TemperatureLineChart from "./components/LineChart";
import AreaChart from "./components/AreaChart";

function App() {
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getWeatherData();
        setWeatherData(data);
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      }
    };

    fetchData();
  }, []);

  if (!weatherData) {
    return <p>Loading weather data...</p>;
  }

  // Extract relevant data for relative humidity chart
  const humidityData = weatherData.hourly.relativehumidity_2m;
 const labels = weatherData.hourly.time.map((timestamp: string) =>
   format(new Date(timestamp), "dd MMM yyyy, HH:mm")
 );
  const maxTemp = weatherData.daily.temperature_2m_max || [];
  const minTemp = weatherData.daily.temperature_2m_min || [];
  const directRadiationData = weatherData.hourly.direct_radiation || [];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Weather Dashboard</h1>
      <div className={styles.chart}>
        <ColumnChart data={humidityData} labels={labels} />
      </div>
      <div className={styles.chart}>
        <TemperatureLineChart
          labels={labels}
          maxTemp={maxTemp}
          minTemp={minTemp}
        />
      </div>
      <div className={styles.chart}>
        <AreaChart data={directRadiationData} labels={labels} />
      </div>
    </div>
  );
}

export default App;
