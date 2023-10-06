import lalToJpr from "./coordinateTransformation/lalToJpr.ts";
import systemCodeToOrigin from "./utils/systemCodeToOrigin.ts";
import { type SystemCode } from "../../@types/Vector.ts";
import { type MapInfo } from "../../@types/Map.ts";
import { type DEMData } from "../../@types/GeoJSON.ts";
import { NULL } from "../constants.ts";

/**
 * 5mメッシュの格子点を表現する配列にデータをプロットする
 * @param data プロットするデータ
 * @param mapInfo
 * @param systemCode
 */
export default function plotDataToArray(
  data: DEMData[],
  mapInfo: MapInfo,
  systemCode: SystemCode,
): { altiMap: number[][]; waterMask: boolean[][] } {
  const { top, bottom, left } = mapInfo.paddingAABB;
  const size = Math.floor((top - bottom) / 5);

  const altiMap = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => NULL),
  );
  const waterMask = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );

  data.forEach(({ coordinate, alti, isWater }) => {
    const [y, x] = lalToJpr(coordinate, systemCodeToOrigin(systemCode));

    const i = Math.floor((x - bottom) / 5);
    const j = Math.floor((y - left) / 5);

    if (0 <= i && i <= size - 1)
      if (0 <= j && j <= size - 1) {
        waterMask[i][j] = isWater;

        if (altiMap[i][j] === NULL) altiMap[i][j] = alti;
      }
  });

  return { altiMap, waterMask };
}
