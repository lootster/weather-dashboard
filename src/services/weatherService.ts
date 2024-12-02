import axios from 'axios';

const API_URL = 'https://api.open-meteo.com/v1/forecast';
const LATITUDE = '1.29';
const LONGITUDE = '103.85';
const START_DATE = '2024-11-01';
const END_DATE = '2024-11-10';

export const getWeatherData = async () => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        hourly: 'relativehumidity_2m,direct_radiation',
        daily: 'temperature_2m_max,temperature_2m_min',
        timezone: 'Asia/Singapore',
        start_date: START_DATE,
        end_date: END_DATE,
      },
    });
    console.log("API Response:", response.data); // <--- Log the response here
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data', error);
    throw error;
  }
};

