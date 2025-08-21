import { fetchDailyStock } from "@/lib/alphaVantage";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const symbol = new URL(req.url).searchParams.get("symbol") || "IBM";
  try {
    const data = await fetchDailyStock(symbol);
    console.log(data);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
