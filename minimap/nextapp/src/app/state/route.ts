import { NextResponse } from "next/server";
import { gameState } from "@/data/data";

export async function GET() {
  return NextResponse.json({ state: gameState.content.state });
}
