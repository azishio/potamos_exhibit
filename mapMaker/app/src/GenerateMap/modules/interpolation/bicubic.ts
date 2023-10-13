/* eslint-disable no-irregular-whitespace */
import { NULL } from "../../constants.ts";
import { flatten4DTo2D } from "../utils/math.ts";
import type Progress from "../../../ui/progress.ts";

function calcWeight(d: number, a: number): number {
  const D = Math.abs(d);
  if (D <= 1) return (a + 2) * D ** 3 - (a + 3) * D ** 2 + 1;
  if (D <= 2) return a * D ** 3 - 5 * a * D ** 2 + 8 * a * D - 4 * a;
  return 0;
}

export function bicubicMissingInterpolation(
  data: number[][],
  a: number,
  overshootSuppression: number,
  nullAs = NULL,
  progress?: Progress,
): number[][] {
  const xMax = data.length;
  const yMax = data[0].length;

  const { min, max, abs } = Math;
  const X = (x: number): number => max(0, min(x, xMax - 1));
  const Y = (y: number): number => max(0, min(y, yMax - 1));

  progress?.init(xMax * yMax);

  const result = Array.from({ length: xMax }, (_, x) =>
    Array.from({ length: yMax }, (__, y) => {
      progress?.increment();

      // すでに値が存在したらそのまま返す
      if (data[x][y] !== NULL) return data[x][y];

      // 重み付き平均の重み*値
      let validNum = 0;
      // 重み付き平均の重みの合計
      let sumWeight = 0;

      for (let dx = -2; dx <= 2; dx++)
        for (let dy = -2; dy <= 2; dy++) {
          const value =
            data[X(x + dx)][Y(y + dy)] === NULL
              ? nullAs
              : data[X(x + dx)][Y(y + dy)];

          if (value !== NULL) {
            const weight =
              calcWeight(dx === 0 ? 0 : abs(dx) - 0.5, a) *
              calcWeight(dy === 0 ? 0 : abs(dy) - 0.5, a);

            sumWeight += weight;
            validNum += value * weight;
          }
        }

      if (sumWeight === 0) return NULL;
      return validNum / sumWeight;
    }),
  );

  progress?.clear();

  return result;
}

export function bicubicUpSampling(
  scale: number,
  data: number[][],
  a: number,
  overshootSuppression: number,
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

      return Array.from({ length: validScale }, (___, _x) =>
        Array.from({ length: validScale }, (____, _y) => {
          let maxValue = Number.MIN_SAFE_INTEGER;
          let minValue = Number.MAX_SAFE_INTEGER;
          let validNum = 0;
          let sumWeight = 0;
          let count = 0;

          for (let dx = -1; dx <= 2; dx++)
            for (let dy = -1; dy <= 2; dy++) {
              const value = data[X(x + dx)][Y(y + dy)];
              if (value !== NULL) {
                const weight =
                  calcWeight(
                    dx <= 0 ? -dx + _x / maxIndex : dx - _x / maxIndex,
                    a,
                  ) *
                  calcWeight(
                    dy <= 0 ? -dy + _y / maxIndex : dy - _y / maxIndex,
                    a,
                  );

                sumWeight += weight;
                validNum += value * weight;
                count++;
                if (value > maxValue) maxValue = value;
                if (value < minValue) minValue = value;
              }
            }
          if (count === 0) return NULL;
          const result = validNum / sumWeight;
          const delta = maxValue - minValue;

          return result > minValue - delta * overshootSuppression ||
            result < maxValue + delta * overshootSuppression
            ? result
            : (maxValue + minValue) / 2;
        }),
      );
    }),
  );

  progress?.clear();
  return flatten4DTo2D(upSampledData);
}
