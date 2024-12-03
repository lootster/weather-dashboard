import React, { useEffect, useState } from "react";
import { getWeatherData } from "./services/weatherService";
import { format } from "date-fns";
import styles from "./App.module.css";
import ColumnChart from "./components/ColumnChart";
import TemperatureLineChart from "./components/LineChart";
import AreaChart from "./components/AreaChart";
import {
  initializeDatabase,
  saveWeatherData,
  getOfflineWeatherData,
} from "./services/databaseService";

function App() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAndFetchData = async () => {
      try {
        // Set loading to true when data fetching starts
        setLoading(true);

        // Initialize the local database
        await initializeDatabase();

        // Try to get offline data if available
        const offlineData = await getOfflineWeatherData();
        if (offlineData) {
          console.log("Offline data retrieved:", offlineData);
          setWeatherData(offlineData);
          setSource("Offline Data (Local Database)");
          setLoading(false); // Data is loaded, set loading to false
          return;
        }

        // Check the network status and proceed accordingly
        if (navigator.onLine) {
          console.log("No offline data found. Attempting to fetch from API...");
          const data = await getWeatherData();
          console.log("Data fetched from API:", data);
          setWeatherData(data);
          setSource("API");
          await saveWeatherData(data);
        } else {
          console.error(
            "No offline data available and no internet connection."
          );
          setError("No internet connection and no offline data available.");
        }
      } catch (error) {
        console.error("Failed to fetch or store weather data:", error);
        setError("Failed to fetch weather data. Please try again.");
      } finally {
        // Ensure loading is set to false at the end of the fetch process
        setLoading(false);
      }
    };

    initializeAndFetchData();
  }, []);

  if (loading) {
    // Show a loading message while data is being fetched
    return <p>Loading weather data...</p>;
  }

  if (error) {
    // Show an error message if there is an error or if the app is offline with no data
    return <p className={styles.error}>{error}</p>;
  }

  // Ensure that the required data is available
  if (!weatherData || !weatherData.hourly || !weatherData.daily) {
    return <p>Data is incomplete. Unable to load the dashboard.</p>;
  }

  // Extract relevant data for relative humidity chart
  const humidityData = weatherData.hourly.relativehumidity_2m;
  const maxTemp = weatherData.daily.temperature_2m_max || [];
  const minTemp = weatherData.daily.temperature_2m_min || [];
  const directRadiationData = weatherData.hourly.direct_radiation || [];

  // Labels for hourly data (relative humidity and radiation)
  const hourlyLabels = weatherData.hourly.time.map((timestamp: string) =>
    format(new Date(timestamp), "dd MMM yyyy, HH:mm")
  );

  // Labels for daily data (temperature)
  const dailyLabels = weatherData.daily.time.map((timestamp: string) =>
    format(new Date(timestamp), "dd MMM yyyy")
  );

  return (
    <div
      className={`${styles.container} ${
        source === "API" ? styles.api : styles.offline
      }`}
    >
      <h1 className={styles.title}>Weather Dashboard</h1>
      <p>Data source: {source}</p>

      <div className={styles.chart}>
        <ColumnChart data={humidityData} labels={hourlyLabels} />
      </div>

      <div className={styles.chart}>
        <TemperatureLineChart
          labels={dailyLabels}
          maxTemp={maxTemp}
          minTemp={minTemp}
        />
      </div>

      <div className={styles.chart}>
        <AreaChart data={directRadiationData} labels={hourlyLabels} />
      </div>
    </div>
  );
}

export default App;
