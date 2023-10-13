import { NextResponse } from "next/server";

export async function GET() {
  console.log("aaa");
  return NextResponse.json({ start: true, x: 0, y: 0, z: 5000 });
}
