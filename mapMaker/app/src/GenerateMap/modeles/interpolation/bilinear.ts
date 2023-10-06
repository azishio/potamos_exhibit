/* eslint-disable no-irregular-whitespace */
import { NULL } from "../../constants.ts";
import { average, flatten4DTo2D } from "../utils/math.ts";
import type Progress from "../../../ui/progress.ts";

export function bilinearMissingInterpolation(
  data: number[][],
  nullAs = NULL,
  progress?: Progress,
): number[][] {
  const xMax = data.length;
  const yMax = data[0].length;

  const { min, max } = Math;
  const X = (x: number): number => max(0, min(x, xMax - 1));
  const Y = (y: number): number => max(0, min(y, yMax - 1));

  progress?.init(xMax * yMax);

  const result = Array.from({ length: xMax }, (_, x) =>
    Array.from({ length: yMax }, (__, y) => {
      progress?.increment();

      // すでに値が存在したらそのまま帰す
      if (data[x][y] !== NULL) return data[x][y];

      const validNum: number[] = [];

      // 隣接する要素がNULLでなければvalidNumに入れる
      for (let xx = x - 1; xx <= x + 1; xx++)
        for (let yy = y - 1; yy <= y + 1; yy++) {
          if (xx === x && yy === y) continue;

          const value =
            data[X(xx)][Y(yy)] === NULL ? nullAs : data[X(xx)][Y(yy)];
          if (value !== NULL) validNum.push(value);
        }

      if (validNum.length === 0) return NULL;
      return average(validNum);
    }),
  );

  progress?.clear();

  return result;
}
export function bilinearUpSampling(
  scale: number,
  data: number[][],
  progress?: Progress,
): number[][] {
  const xMax = data.length;
  const yMax = data[0].length;

  const { min, max, abs, floor } = Math;
  const X = (x: number): number => max(0, min(x, xMax - 1));
  const Y = (y: number): number => max(0, min(y, yMax - 1));

  const validScale = abs(floor(scale));
  const maxIndex = validScale - 1;

  progress?.init(xMax * yMax);

  const upSampledData = Array.from({ length: xMax }, (_, x) =>
    Array.from({ length: yMax }, (__, y) => {
      progress?.increment();

      let validNum = 0;
      let sumWeight = 0;

      return Array.from({ length: validScale }, (___, _x) =>
        Array.from({ length: validScale }, (____, _y) => {
          // 隣接する要素がNULLでなければvalidNumに入れる
          for (let dx = 0; dx <= 1; dx++)
            for (let dy = 0; dy <= 1; dy++) {
              const value = data[X(x + dx)][Y(y + dy)];
              if (value !== NULL) {
                const weight = abs(
                  (dx + (_x / maxIndex - 0.5)) * (dy + (_y / maxIndex - 0.5)),
                );

                validNum += value * weight;
                sumWeight += weight;
              }
            }

          if (sumWeight === 0) return NULL;
          return validNum / sumWeight;
        }),
      );
    }),
  );

  progress?.clear();

  return flatten4DTo2D(upSampledData);
}
