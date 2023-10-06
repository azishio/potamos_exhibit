import { Request } from "next/dist/compiled/@edge-runtime/primitives";
import { InitReqBody } from "@/@type/InitReqBody";
import fsp from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import connectMongo from "@/db/connectMongo";
import { Coordinate, GameEvent, GameInfo } from "@/db/model";

export async function POST(req: Request) {
  const { nickname, items }: InitReqBody = await req.json();

  const initCoordinateList: [number, number][] = JSON.parse(
    await fsp.readFile(
      path.join(process.cwd(), "data/initCoordinates.json"),
      "utf-8",
    ),
  );

  const initCoordinate =
    initCoordinateList[Math.floor(Math.random() * initCoordinateList.length)];

  try {
    await connectMongo();
    // 初期化
    await Coordinate.deleteMany();
    await Coordinate.create({ coordinate: initCoordinate });
    await GameEvent.deleteMany();
    await GameEvent.create({
      event: "start",
      coordinate: initCoordinate,
    });
    await GameInfo.deleteMany();
    await GameInfo.create({ nickname, items });

    return NextResponse.json({});
  } catch (err) {
    if (err !== undefined) {
      console.log("初期化できなかった！！");
      console.log(err);
      return NextResponse.error();
    }
  }
}
