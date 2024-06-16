import React, { useState } from "react";
import axios from "axios";
import DarkMode from "../../components/DarkMode/DarkMode";

/**
 * Converts keys in the given data object from snake_case to camelCase.
 * Recursively processes nested objects and arrays.
 */
function convertKeysToCamelCase(data) {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertKeysToCamelCase(item));
  }

  const camelCaseData = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const camelCaseKey = key.replace(/_([a-z])/g, (match, group1) =>
        group1.toUpperCase()
      );
      camelCaseData[camelCaseKey] = convertKeysToCamelCase(data[key]);
    }
  }
  return camelCaseData;
}

/**
 * The Weather component fetches and displays weather information for a specified location.
 */
function Weather() {
  const [data, setData] = useState({}); // State to store weather data
  const [location, setLocation] = useState(""); // State to store user input location

  // URL for getting geolocation data based on the input location
  const geoLocationUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=06f548de4f05575289aab50c091bac4b`;

  /**
   * Handles the search action when the Enter key is pressed.
   * Fetches geolocation data and then weather data based on the user's input location.
   */
  const searchLocation = (event) => {
    if (event.key === "Enter") {
      axios.get(geoLocationUrl).then((response) => { // Fetch geolocation data
        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=06f548de4f05575289aab50c091bac4b`;
          axios.get(weatherUrl).then((response) => {  // Fetch weather data
            const updatedData = convertKeysToCamelCase(response.data);
            console.log(updatedData);
            setData(updatedData);
          });
        } else {
          alert("Location not found.");
        }
        setLocation("");
      });
    }
  };

  const unixTimestamp = data.dt; // Unix timestamp from the API response

  // Create a new date object with the Unix timestamp from the API, adjusted by the timezone offset
  const date = new Date((unixTimestamp + data.timezone) * 1000);

  // Format date
  const optionsDate = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-GB", optionsDate);

  // Format time
  const optionsTime = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const formattedTime = date.toLocaleTimeString("en-US", optionsTime);

  return (
    <div className="app">
      <div className="header">
        <div className="search">
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            onKeyDown={searchLocation}
            placeholder="Enter Location"
            type="text"
          />
        </div>
        <button className="toggle-container">
          <DarkMode />
        </button>
      </div>
      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            {data.main ? <h1>{data.main.feelsLike.toFixed()}°C</h1> : null}
          </div>
          <div className="date-time">
            {data.main ? <p>{formattedDate}</p> : null}
            {data.main ? <p>Time: {formattedTime}</p> : null}
          </div>
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
        </div>

        {data.name !== undefined && (
          <div className="bottom">
            <div className="feels">
              {data.main ? (
                <p className="bold">{data.main.feelsLike.toFixed()}°C</p>
              ) : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? <p className="bold">{data.main.humidity}%</p> : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind ? (
                <p className="bold">{data.wind.speed.toFixed()} km/h</p>
              ) : null}
              <p>Winds</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Weather;
