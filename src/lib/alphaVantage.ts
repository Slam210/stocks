export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface AlphaVantageDailyResponse {
  "Time Series (Daily)": Record<
    string,
    {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    }
  >;
}

export async function fetchDailyStock(symbol: string): Promise<StockData[]> {
  if (!process.env.ALPHA_VANTAGE_API_KEY) {
    throw new Error("Missing Alpha Vantage API key");
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
  console.log(url);
  const res = await fetch(url);

  if (!res.ok) throw new Error(`API request failed: ${res.status}`);

  const data: AlphaVantageDailyResponse = await res.json();
  const timeSeries = data["Time Series (Daily)"];
  if (!timeSeries) throw new Error("Unexpected API response");

  return Object.entries(timeSeries).map(([date, values]) => ({
    date,
    open: parseFloat(values["1. open"]),
    high: parseFloat(values["2. high"]),
    low: parseFloat(values["3. low"]),
    close: parseFloat(values["4. close"]),
    volume: parseInt(values["5. volume"], 10),
  }));
}
