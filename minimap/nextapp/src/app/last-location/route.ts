import { Request, Response } from "next/dist/compiled/@edge-runtime/primitives";
import { NextResponse } from "next/server";
import connectMongo from "@/db/connectMongo";
import { Coordinate } from "@/db/model";

export async function GET() {
  try {
    await connectMongo();

    const lastCoordinate = (
      await Coordinate.find().sort({ _id: -1 }).limit(1)
    )[0].coordinate;

    return NextResponse.json(lastCoordinate);
  } catch (err) {
    if (err !== undefined) {
      console.log(err);
      return Response.error();
    }
  }
}
export async function POST(req: Request) {
  const { x, y } = await req.json();
  if (typeof x !== "number" || typeof y !== "number")
    return NextResponse.json({ continue: false });

  try {
    await connectMongo();
    await Coordinate.create({ x, y });
    console.log(x, y);
    return NextResponse.json({ continue: true });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ continue: false });
  }

  return NextResponse;
}
