import fs from "fs";
import { type SystemCode, type Vector2D } from "../../../@types/Vector.ts";

function objValidator(obj: unknown): boolean {
  if (
    !(
      typeof obj === "object" &&
      obj !== null &&
      "systemCode" in obj &&
      "coordinates" in obj
    )
  )
    throw new Error("points.jsonの内容が不正です");

  if (
    ![
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    ].some((v) => obj.systemCode === v)
  )
    throw new Error("systemCodeの内容が不正です");

  if (!Array.isArray(obj.coordinates))
    throw new Error("coordinatesは配列である必要があります");

  if (
    !obj.coordinates.every(
      (v) =>
        Array.isArray(v) &&
        v.length === 2 &&
        typeof v[0] === "number" &&
        typeof [1] === "number",
    )
  )
    return true;
  throw new Error("coordinatesの内容が不正です");
}

/**
 * プロジェクト内のpoints.jsonを読み込み、パースして返す
 */
export default async function readPointsFile(filePath: string): Promise<{
  systemCode: SystemCode;
  coordinates: Vector2D[];
}> {
  const str = fs.readFileSync(filePath, "utf-8");
  const obj = JSON.parse(str);

  objValidator(obj);
  return obj;
}
