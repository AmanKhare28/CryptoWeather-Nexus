"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addFavoriteCity,
  removeFavoriteCity,
} from "../../redux/preferencesSlice";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const WeatherDetails = () => {
  const [city, setCity] = useState("London");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [hourlyTemperatures, setHourlyTemperatures] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dispatch = useDispatch();
  const favoriteCities = useSelector((state) =>
    state.preferences.favoriteCities.slice(-5)
  );

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const fetchWeather = async (city) => {
    setError(null);
    setWeatherData(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      const response = await axios.get(
        `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&hours=10`
      );
      setWeatherData(response.data);
      handleAlerts(response.data.alerts);
      setHourlyTemperatures(
        response.data.forecast.forecastday[0].hour.slice(0, 10)
      );
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
    }
  };

  const handleAlerts = (alerts) => {
    if (alerts && alerts.alert && alerts.alert.length > 0) {
      alerts.alert.forEach((alert) => {
        toast.warn(`${alert.headline}\n${alert.desc}`, {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
      setShowDropdown(false);
    }
  };

  const handleFavorite = (cityName) => {
    if (favoriteCities.includes(cityName)) {
      dispatch(removeFavoriteCity(cityName));
    } else {
      dispatch(addFavoriteCity(cityName));
    }
  };

  return (
    <div className="px-24 pt-12 h-screen text-white w-full">
      <ToastContainer />
      <h1 className="text-5xl font-extrabold">🌤️ Weather Details</h1>

      {/* Search Bar */}
      <div className="flex flex-col items-center mt-6 relative">
        <form onSubmit={handleSearch} className="flex justify-center relative">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="pl-7 rounded-l-4xl text-black w-80 bg-white outline-0"
          />
          <button
            type="submit"
            className="bg-white px-6 py-3 rounded-r-4xl font-bold hover:bg-blue-800 transition"
          >
            <img src="/search.svg" alt="Search" />
          </button>
        </form>

        {/* Favorite Cities Dropdown */}
        {showDropdown && favoriteCities.length > 0 && (
          <ul className="absolute bg-white text-black mt-20 rounded-xl shadow-lg w-80">
            {favoriteCities.map((favCity, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-200 cursor-pointer rounded-xl flex justify-between"
                onClick={() => {
                  setCity(favCity);
                  fetchWeather(favCity);
                  setShowDropdown(false);
                }}
              >
                {favCity}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(favCity);
                  }}
                  className="text-red-500 ml-4"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Weather Details Section */}
      <div className="mt-10 mb-16">
        {error ? (
          <p className="text-red-500 text-lg">{error}</p>
        ) : weatherData ? (
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-1/2 text-center mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-bold">
                  {weatherData.location.name}
                </h2>
                <p className="text-lg text-gray-200">
                  {weatherData.location.country}
                </p>
              </div>
              <button
                onClick={() => handleFavorite(weatherData.location.name)}
                className="mt-4 px-4 py-2 rounded-md"
              >
                {favoriteCities.includes(weatherData.location.name) ? (
                  <img src="/star2.svg" className="w-6" />
                ) : (
                  <img src="/star1.svg" className="w-6" />
                )}
              </button>
            </div>
            <p className="text-9xl font-extrabold mt-4">
              {weatherData.current.temp_c}°C
            </p>
            <p className="text-xl font-medium text-gray-200">
              {weatherData.current.condition.text}
            </p>
            <div className="mt-6 bg-white/20 p-4 rounded-xl text-lg font-semibold text-gray-100">
              <p>💧 Precipitation: {weatherData.current.precip_mm} mm</p>
              <p>💧 Humidity: {weatherData.current.humidity}%</p>
              <p>🌡️ Pressure: {weatherData.current.pressure_mb} mb</p>
            </div>
          </div>
        ) : (
          <p className="text-lg">Fetching weather data...</p>
        )}
      </div>

      {/* 10-Hour Temperature History */}
      <div className="bg-gray-700 p-6 rounded-xl shadow-lg mx-auto">
        <h3 className="text-2xl font-semibold mb-4">
          Last 10 Hourly Temperatures
        </h3>
        <div className="flex justify-between">
          {hourlyTemperatures.map((hour, index) => (
            <div key={index} className="text-center p-3 bg-gray-600 rounded-md">
              <p className="text-lg font-bold">{hour.time.split(" ")[1]}</p>
              <p className="text-xl">{hour.temp_c}°C</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 p-6 mt-10 rounded-xl shadow-lg w-3/4 mx-auto">
        <h3 className="text-2xl font-semibold mb-4">Temperature Trend</h3>
        <Line
          data={{
            labels: hourlyTemperatures.map((hour) => hour.time.split(" ")[1]),
            datasets: [
              {
                label: "Temperature (°C)",
                data: hourlyTemperatures.map((hour) => hour.temp_c),
                borderColor: "#4CAF50",
                fill: false,
              },
            ],
          }}
        />
      </div>
    </div>
  );
};

export default WeatherDetails;
