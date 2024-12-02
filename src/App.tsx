import React, { useEffect, useState } from "react";
import { getWeatherData } from "./services/weatherService";
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
  const labels = weatherData.hourly.time;
  const maxTemp = weatherData.daily.temperature_2m_max || [];
  const minTemp = weatherData.daily.temperature_2m_min || [];
  const directRadiationData = weatherData.hourly.direct_radiation || [];

  return (
    <div className="App">
      <h1>Weather Dashboard</h1>
      <ColumnChart data={humidityData} labels={labels} />
      <TemperatureLineChart
        labels={labels}
        maxTemp={maxTemp}
        minTemp={minTemp}
      />
      <AreaChart data={directRadiationData} labels={labels} />
    </div>
  );
}

export default App;
