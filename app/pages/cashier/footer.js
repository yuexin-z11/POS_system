/**
 * Footer Component
 * 
 * @author Yuexin Zhang
 * @description Displaying the footer component fetching current date, time and weather information. 
 * 
 */

import { useEffect, useState } from 'react';
import styles from './pos.module.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

/**
 * Renders a footer displaying date, time, and weather information. 
 * 
 * @returns {JSX.Element} The Footer component. 
 */
const Footer = () => {
  const [currentTime, setCurrentTime] = useState({ date: '', time: '' });
  const [weatherData, setWeatherData] = useState(null);

  /**
   * Fetches the current date and time from a public API.
   * 
   * @async
   * @throws {Error} if the API request fails. 
   */
  const fetchTime = async () => {
    try {
      const response = await axios.get('https://worldtimeapi.org/api/timezone/Etc/UTC');
      const data = response.data;
      const dateTime = new Date(data.utc_datetime);
      setCurrentTime({
        date: dateTime.toLocaleDateString(),
        time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // No seconds
      });
    } catch (error) {
      console.error("Error fetching time:", error);
    }
  };

  /**
  * Initializes the time fetching process and sets up an interval to update the time every minute.
  */
  useEffect(() => {
    fetchTime();  // Fetch initial time
    const intervalId = setInterval(fetchTime, 60000);  

    // Clear the interval on cleanup
    return () => clearInterval(intervalId);
  }, []);

  /**
   * Fetches weather data for College Station from the OpenWeather API.
   * 
   * @async
   * @throws {Error} if the API request fails or returns a non-OK response. 
   */
  const fetchWeatherData = async () => {
    const apiKey = 'b2194f151958777dc04aa218c55b2dd0';
    const city = 'College Station';  // Replace with the desired city name or use coordinates for accuracy
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else {
        console.error('Failed to fetch weather data');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  /**
   * Fetches weather data when the component mounts. 
   */
  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.buttonContainer}>
      </div>
      <div className={styles.infoContainer}>
        <p>Date: {currentTime.date}</p> 
        <p>Time: {currentTime.time}</p> 
        {weatherData ? (
          <>
            <h3>Weather in {weatherData.name}</h3>
            <p>Temperature: {weatherData.main.temp} °C</p>
            <p>Condition: {weatherData.weather[0].description}</p>
          </>
        ) : (
          <p>Loading weather data...</p>
        )}
      </div>
    </footer>
  );
};

export default Footer;

