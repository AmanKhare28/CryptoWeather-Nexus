"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const Crypto = () => {
  const [cryptoData, setCryptoData] = useState({});
  const [marketData, setMarketData] = useState({});
  const [error, setError] = useState(null);
  const cryptoList = ["bitcoin", "ethereum", "litecoin"];
  const socketRef = useRef(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 5;

  // Fetch market cap & 24h change from REST API
  const fetchMarketData = async () => {
    try {
      const response = await fetch("https://api.coincap.io/v2/assets");
      const data = await response.json();

      console.log("API Response:", data); // Debugging log

      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid API response format");
      }

      const filteredData = {};
      data.data.forEach((crypto) => {
        if (cryptoList.includes(crypto.id)) {
          filteredData[crypto.id] = {
            marketCap: crypto.marketCapUsd,
            changePercent: crypto.changePercent24Hr,
          };
        }
      });
      setMarketData(filteredData);
    } catch (err) {
      console.error("Market data fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMarketData(); // Fetch market data initially
    const marketDataInterval = setInterval(fetchMarketData, 30000); // Refresh every 30s

    const connectWebSocket = () => {
      if (retryCount.current >= MAX_RETRIES) {
        setError("WebSocket connection failed. Please refresh the page.");
        return;
      }

      socketRef.current = new WebSocket(
        "wss://ws.coincap.io/prices?assets=bitcoin,ethereum,litecoin"
      );

      socketRef.current.onopen = () => {
        console.log("WebSocket connected!");
        retryCount.current = 0;
        setError(null);
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setCryptoData((prev) => ({ ...prev, ...data }));
      };

      socketRef.current.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("WebSocket connection failed. Retrying...");
      };

      socketRef.current.onclose = () => {
        console.warn("WebSocket disconnected. Retrying in 3 seconds...");
        retryCount.current += 1;
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
      clearInterval(marketDataInterval);
    };
  }, []);

  // Format market cap (B for billion, M for million)
  const formatMarketCap = (value) => {
    if (!value) return "N/A";
    const num = parseFloat(value);
    return num >= 1e9
      ? `$${(num / 1e9).toFixed(2)}B`
      : `$${(num / 1e6).toFixed(2)}M`;
  };

  return (
    <div className="px-24 pt-12">
      <div className="flex justify-between items-baseline">
        <h1 className="text-white font-extrabold text-7xl tracking-wide">
          🪙 Live Crypto Prices
        </h1>
        <Link
          href="/cryptodetails"
          className="text-white hover:underline text-lg"
        >
          More Details ➡️
        </Link>
      </div>

      <div className="mt-10 text-white flex justify-between gap-8">
        {error ? (
          <p className="text-red-500 text-lg">{error}</p>
        ) : (
          cryptoList.map((crypto) => {
            const price = cryptoData[crypto]
              ? parseFloat(cryptoData[crypto]).toFixed(2)
              : "Loading...";
            const marketCap = formatMarketCap(marketData[crypto]?.marketCap);
            const priceChange = marketData[crypto]?.changePercent
              ? parseFloat(marketData[crypto].changePercent).toFixed(2)
              : "N/A";
            const isPositive = priceChange >= 0;

            return (
              <div
                key={crypto}
                className="bg-gray-800 p-8 rounded-2xl shadow-xl w-1/3 text-center transform transition-all hover:scale-105 hover:shadow-2xl"
              >
                <h2 className="text-4xl font-bold drop-shadow-lg">
                  {crypto.toUpperCase()}
                </h2>
                <p className="text-6xl font-extrabold mt-4 drop-shadow-md">
                  ${price}
                </p>
                <p className="text-lg mt-2">Market Cap: {marketCap}</p>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    isPositive ? "text-green-400" : "text-red-500"
                  }`}
                >
                  {isPositive ? "▲" : "▼"} {priceChange}%
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Crypto;
