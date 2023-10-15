import fs from "graceful-fs";
import {
  type Feature,
  type FeatureCollection,
  type GeoJsonProperties,
  type LineString,
} from "geojson";
import path from "path";
import { type MapInfo } from "../../@types/Map.ts";
import { type Vector2D } from "../../@types/Vector.ts";

function readBldgLine(obj: unknown): Vector2D[][] {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "type" in obj &&
    "features" in obj &&
    Array.isArray(obj.features)
  ) {
    const typedFC = obj as FeatureCollection;
    return (
      typedFC.features.filter(
        (feature) => feature.properties?.class === "BldL",
      ) as Array<Feature<LineString, GeoJsonProperties>>
    ).map((feature) => feature.geometry.coordinates) as Vector2D[][];
  }
  return [];
}

export default function readBldgData(
  dirPath: string,
  mapInfo: MapInfo,
): Vector2D[][] {
  const useFileNameList = mapInfo.tileList18.map(
    ([x, y]) => `${x}_${y}.geojson`,
  );
  const fileList = new Set(fs.readdirSync(dirPath));

  const dataList: Vector2D[][][] = [];

  useFileNameList.forEach((v) => {
    if (!fileList.has(v)) return;
    dataList.push(
      readBldgLine(
        JSON.parse(
          fs.readFileSync(path.join(dirPath, v), {
            encoding: "utf-8",
          }),
        ),
      ),
    );
  });
  return dataList.flat();
}
