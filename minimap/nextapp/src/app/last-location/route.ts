import { gameState } from "@/data/data";
import jprToLal from "@/vectorOperation/jprToLal";
import { readBoundary, readLAL0 } from "@/data/readFiles";
import { NextResponse } from "next/server";
import beGoal from "@/app/last-location/judgment/beGoal";
import beDead from "@/app/last-location/judgment/beDead";

export async function GET() {
  return NextResponse.json(gameState.content.getLastCoordinate());
}
export async function POST(req: Request) {
  const { x, y } = await req.json();

  // mapInfoから

  const {
    top,
    bottom,
    left,
    right,
  }: { top: number; bottom: number; left: number; right: number } =
    await readBoundary();

  const transX = x / 100 + (top + bottom) / 2;
  const transY = y / 100 + (left + right) / 2;

  if (typeof x !== "number" || typeof y !== "number")
    return NextResponse.json({ continue: false });

  const lal = jprToLal([transY, transX], await readLAL0());

  gameState.content.setCoordinate(lal);

  if (await beGoal()) {
    gameState.content.state = "goal";
    return NextResponse.json({ continue: false });
  }

  if (await beDead()) {
    console.log("DEAD");
  }

  console.log(gameState.content.getLastCoordinate());

  return NextResponse.json({ continue: true });
}
