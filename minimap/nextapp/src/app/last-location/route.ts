import { Request } from "next/dist/compiled/@edge-runtime/primitives";
import { NextResponse } from "next/server";
import { gameState } from "@/data/data";
import jprToLal from "@/vectorOperation/jprToLal";
import { readLAL0 } from "@/data/readFiles";
import lalToJpr from "@/vectorOperation/lalToJpr";

export async function GET() {
  return NextResponse.json(gameState.state.getLastCoordinate());
}
export async function POST(req: Request) {
  const { x, y } = await req.json();

  // mapInfoから

  const [offsetY, offsetX] = lalToJpr(
    [139.542258, 36.244838],
    await readLAL0(),
  );

  const transY = x / 100 + offsetY;
  const transX = y / 100 + offsetX;

  if (typeof x !== "number" || typeof y !== "number")
    return NextResponse.json({ continue: false });

  gameState.state.setCoordinate(jprToLal([transY, transX], await readLAL0()));
  console.log(gameState.state.getLastCoordinate());

  return NextResponse.json({ continue: true });
}
