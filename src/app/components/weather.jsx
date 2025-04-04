"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

const Weather = () => {
  const [weatherData, setWeatherData] = useState({
    London: null,
    Toronto: null,
    Tokyo: null,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async (city, key) => {
      try {
        const response = await axios.get(
          `https://api.weatherapi.com/v1/current.json?key=${key}&q=${city}`
        );
        setWeatherData((prev) => ({ ...prev, [city]: response.data }));
        console.log(weatherData);
      } catch (err) {
        setError("Failed to fetch weather data");
      }
    };

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    fetchWeather("London", apiKey);
    fetchWeather("Toronto", apiKey);
    fetchWeather("Tokyo", apiKey);
  }, []);

  return (
    <div className="px-24 pt-12 h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-white font-extrabold text-7xl tracking-wide">
          🌎 Weather Now
        </h1>
        <Link
          href="/weatherdetails"
          className="text-white hover:underline text-lg"
        >
          More Details ➡️
        </Link>
      </div>

      <div className="mt-10 text-white flex justify-between gap-8">
        {error ? (
          <p className="text-red-500 text-lg">{error}</p>
        ) : (
          Object.entries(weatherData).map(([city, data]) => (
            <div
              key={city}
              className="bg-gray-800 p-8 rounded-2xl shadow-xl w-1/3 text-center transform transition-all hover:scale-105 hover:shadow-2xl"
            >
              {data ? (
                <>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-start">
                      <h2 className="text-4xl font-bold drop-shadow-lg">
                        {data.location.name}
                      </h2>
                      <p className="text-lg text-gray-200">
                        {data.location.country}
                      </p>
                    </div>
                    <img
                      src={data.current.condition.icon}
                      alt="Weather Icon"
                      className="w-16 h-16"
                    />
                  </div>

                  <p className="text-7xl font-extrabold mt-6 drop-shadow-md">
                    {data.current.temp_c}°C
                  </p>
                  <p className="text-xl font-medium text-gray-200">
                    {data.current.condition.text}
                  </p>
                  <div className="mt-8 bg-white/20 p-4 rounded-xl text-lg font-semibold text-gray-100 backdrop-blur-sm">
                    <p>💧 Humidity: {data.current.humidity}%</p>
                    <p>💨 Wind: {data.current.wind_kph} km/h</p>
                    <p>🌡️ Pressure: {data.current.pressure_mb} mb</p>
                  </div>
                </>
              ) : (
                <p className="text-lg">Loading {city} weather...</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Weather;
