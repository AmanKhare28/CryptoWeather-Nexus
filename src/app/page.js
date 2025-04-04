import Weather from "./components/weather";
import Crypto from "./components/crypto";
import News from "./components/news";

export default function Home() {
  return (
    <div>
      <Weather />
      <Crypto />
      <News />
    </div>
  );
}
