import { NextResponse } from "next/server";
import connectMongo from "@/db/connectMongo";
import { Coordinate, GameEvent, Items, Nickname } from "@/db/model";

export async function POST() {
  try {
    await connectMongo();
    // 初期化
    await Coordinate.deleteMany();
    await GameEvent.deleteMany();
    await Items.deleteMany();
    await Nickname.deleteMany();

    return NextResponse.json({});
  } catch (e) {
    return NextResponse.json({});
  }
}
