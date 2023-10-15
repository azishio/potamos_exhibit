import { NextResponse } from "next/server";
import { gameState } from "@/data/data";

export async function GET() {
  console.log("aaa");
  gameState.content.setStartTime();
  return NextResponse.json({ start: true, x: 0, y: 0, z: 5000 });
}
