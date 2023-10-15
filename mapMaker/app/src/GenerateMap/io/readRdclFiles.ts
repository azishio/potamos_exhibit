import { type FeatureCollection, type LineString } from "geojson";
import fs from "graceful-fs";
import path from "path";
import { type MapInfo } from "../../@types/Map.ts";
import { type RdclData, type RdclProperties } from "../../@types/GeoJSON.ts";
import { type Vector2D } from "../../@types/Vector.ts";

function readRdclFile(obj: unknown): RdclData[] {
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
      element0.properties.class === "RdCL"
    ) {
      const typedFC = obj as FeatureCollection<LineString, RdclProperties>;

      return typedFC.features.map(
        ({ geometry: { coordinates }, properties: { rnkWidth } }) => ({
          coordinates: coordinates as unknown as Vector2D[],
          width: (() => {
            switch (rnkWidth) {
              case "19.5m以上":
                return 19.5;
              case "13m-19.5m未満":
                return 16.25;
              case "5.5m-13m未満":
                return 9.25;
              case "3m-5.5m未満":
                return 4.25;
              default:
                return 3;
            }
          })(),
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
export default function readRdclFiles(
  dirPath: string,
  mapInfo: MapInfo,
): RdclData[] {
  const useFileNameList = mapInfo.tileList18.map(
    ([x, y]) => `${x}_${y}.geojson`,
  );
  const fileList = new Set(fs.readdirSync(dirPath));

  const dataList: RdclData[][] = [];
  useFileNameList.forEach((v) => {
    if (!fileList.has(v)) return;
    dataList.push(
      readRdclFile(
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
