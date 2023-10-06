import { NextResponse } from "next/server";
import connectMongo from "@/db/connectMongo";
import { GameEvent } from "@/db/model";

export async function GET() {
  try {
    await connectMongo();
    console.log("呼ばれた");
    const { coordinate, event } = (
      await GameEvent.find().sort({ _id: -1 }).limit(1)
    )[0];

    console.log("イベント", event);
    if (event === "start") {
      return NextResponse.json({ ...coordinate, start: true });
    }
  } catch (err) {
    return NextResponse.json({ start: false });
  }
  console.log("待機");
  return NextResponse.json({ start: false });
}
