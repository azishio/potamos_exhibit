import { type FeatureCollection, type Point } from "geojson";
import fs from "graceful-fs";
import path from "path";
import { type MapInfo } from "../../@types/Map.ts";
import { type AltiProperties, type DEMData } from "../../@types/GeoJSON.ts";

function readDEMFile(obj: unknown): DEMData[] {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "type" in obj &&
    "features" in obj &&
    Array.isArray(obj.features)
  ) {
    const element0 = obj.features[0];
    if (
      typeof element0 === "object" &&
      "properties" in element0 &&
      typeof element0.properties === "object" &&
      "class" in element0.properties &&
      element0.properties.class === "DEMPt"
    ) {
      const typedFC = obj as FeatureCollection<Point, AltiProperties>;

      return typedFC.features.map(
        ({
          geometry: {
            coordinates: [long, lat],
          },
          properties: { alti, type },
        }) => ({
          coordinate: [long, lat],
          alti,
          isWater: type === "海水面" || type === "内水面",
        }),
      );
    }
  }
  return [];
}

/**
 * 5mメッシュの格子点を表現する配列にデータをプロットする
 * @param mapInfo
 * @param dirPath ファイルが存在するディレクトリパス
 */
export default function readDEM5Files(
  dirPath: string,
  mapInfo: MapInfo,
): DEMData[] {
  const useFileNameList = mapInfo.tileList18.map(
    ([x, y]) => `${x}_${y}.geojson`,
  );
  const fileList = new Set(fs.readdirSync(dirPath));

  const dataList: DEMData[][] = [];
  useFileNameList.forEach((v) => {
    if (!fileList.has(v)) return;
    dataList.push(
      readDEMFile(
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
