"use client";
import { useState } from "react";

const CryptoDetails = () => {
  const [query, setQuery] = useState("");
  const [cryptoData, setCryptoData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [error, setError] = useState(null);

  const fetchCryptoDetails = async () => {
    const coinId = query.trim().toLowerCase().replace(/\s+/g, "-");
    if (!coinId) return;

    try {
      // Fetch extended metrics
      const response = await fetch(
        `https://api.coincap.io/v2/assets/${coinId}`
      );
      const data = await response.json();

      if (!data || !data.data) {
        throw new Error("Cryptocurrency not found.");
      }

      setCryptoData(data.data);

      // Fetch historical pricing data (e.g., last 30 days)
      const end = Date.now();
      const start = end - 30 * 24 * 60 * 60 * 1000; // 30 days ago
      const historyResponse = await fetch(
        `https://api.coincap.io/v2/assets/${coinId}/history?interval=d1&start=${start}&end=${end}`
      );
      const historyData = await historyResponse.json();

      if (historyData && historyData.data) {
        setHistoricalData(historyData.data);
      } else {
        setHistoricalData([]);
      }

      setError(null);
    } catch (err) {
      setError(err.message);
      setCryptoData(null);
      setHistoricalData([]);
    }
  };

  return (
    <div className="px-24 pt-12 text-white">
      <h1 className="text-5xl font-extrabold mb-6">🔍 Search Cryptocurrency</h1>
      <div className="flex justify-center relative">
        <input
          type="text"
          placeholder="Enter cryptocurrency name (e.g., bitcoin)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-7 rounded-l-4xl text-black w-80 bg-white outline-0"
        />
        <button
          onClick={fetchCryptoDetails}
          className="bg-white px-6 py-3 rounded-r-4xl font-bold hover:bg-blue-800 transition"
        >
          <img src="/search.svg" alt="Search" />
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {cryptoData && (
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl text-center w-1/2 mx-auto mt-6">
          <h2 className="text-4xl font-bold">
            {cryptoData.name} ({cryptoData.symbol.toUpperCase()})
          </h2>
          <p className="text-6xl font-extrabold mt-4">
            ${parseFloat(cryptoData.priceUsd).toFixed(2)}
          </p>
          <p className="text-lg mt-2">
            Market Cap: ${parseFloat(cryptoData.marketCapUsd).toFixed(2)} USD
          </p>
          <p className="text-lg mt-2">
            Supply: {parseFloat(cryptoData.supply).toFixed(0)}
          </p>
          <p className="text-lg mt-2">
            Volume (24Hr): ${parseFloat(cryptoData.volumeUsd24Hr).toFixed(2)}{" "}
            USD
          </p>
        </div>
      )}

      {historicalData.length > 0 && (
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-1/2 mx-auto mt-6">
          <h3 className="text-3xl font-bold mb-4">
            Historical Prices (Last 30 Days)
          </h3>
          <ul className="text-left">
            {historicalData.map((entry, index) => (
              <li key={index} className="mb-2">
                {new Date(entry.time).toLocaleDateString()}: $
                {parseFloat(entry.priceUsd).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CryptoDetails;
