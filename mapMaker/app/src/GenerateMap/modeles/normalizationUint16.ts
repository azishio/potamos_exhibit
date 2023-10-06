import { max2D, min2D } from "./utils/math.ts";
import map2D from "./utils/map2D.ts";
import {
  NULL,
  UE5_HEIGHTMAP_UNIT_RATE,
  UINT16ARRAY_MAX_NUM,
} from "../constants.ts";

export default function normalizationUint16(sourceMap: number[][]): {
  min: number;
  zScale: number;
  normalizedMap: number[][];
} {
  // 引数の上限に引っかかる可能性があるので、Math.max(...source)としてはならない
  const max = max2D(sourceMap);
  const min = min2D(sourceMap.map((a) => a.filter((v) => v !== NULL)));

  const normalizedMap = map2D(sourceMap, (v) =>
    v === NULL
      ? 0
      : Math.round(((v - min) / (max - min)) * UINT16ARRAY_MAX_NUM),
  );

  // UE5向けのパラメータ計算
  const zScale = ((max - min) * 100) / UE5_HEIGHTMAP_UNIT_RATE;

  return {
    min,
    zScale,
    normalizedMap,
  };
}
