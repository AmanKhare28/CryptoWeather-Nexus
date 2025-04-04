"use client";
import { useEffect, useState } from "react";

const News = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const API_URL =
    "https://newsdata.io/api/1/latest?apikey=pub_778447517b05ac8e080827088343f7a96c8fb&q=cryptocurrency";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.results) {
          setNews(data.results.slice(0, 5));
        } else {
          setError("No news available.");
        }
      } catch (err) {
        setError("Failed to fetch news.");
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="px-10 pt-12 text-white mt-20 mb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-white font-extrabold text-6xl tracking-wide">
          📰 Crypto News
        </h1>
      </div>
      <div className="mt-10 space-y-6">
        {error ? (
          <p className="text-red-500 text-lg">{error}</p>
        ) : (
          news.map((article, index) => (
            <div
              key={index}
              className="p-6 bg-white/10 border border-white/20 rounded-xl shadow-lg hover:scale-105 transition duration-300"
            >
              <h2 className="text-2xl font-bold">{article.title}</h2>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 mt-2 inline-block hover:underline"
              >
                Read more ➡️
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default News;
