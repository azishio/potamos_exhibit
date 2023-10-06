import { NULL, SQRT2 } from "../../constants.ts";
import size2D from "../utils/size2D.ts";
import type Progress from "../../../ui/progress.ts";

export default function makeDepression(
  map: number[][],
  mask: boolean[][],
  offset: number,
  factor: number,
  progress?: Progress | undefined,
): number[][] {
  const maxIndex = mask.length - 1;

  progress?.init(size2D(mask));

  const result = Array.from({ length: mask.length }, (_, x) =>
    Array.from({ length: mask[0].length }, (__, y) => {
      progress?.increment();
      if (!mask[x][y]) return NULL;

      const { abs } = Math;
      let distanceToLand = Number.MAX_SAFE_INTEGER;
      let alti = 0;
      // 上
      for (let dx = 1; ; dx++) {
        if (x + dx > maxIndex) break;
        if (!mask[x + dx][y]) {
          const distance = abs(dx);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + dx][y];
          }
          break;
        }
      }
      // 下
      for (let dx = -1; ; dx--) {
        if (x + dx < 0) break;
        if (!mask[x + dx][y]) {
          const distance = abs(dx);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + dx][y];
          }
          break;
        }
      }
      // 右
      for (let dy = 1; ; dy++) {
        if (y + dy > maxIndex) break;
        if (!mask[x][y + dy]) {
          const distance = abs(dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x][y + dy];
          }
          break;
        }
      }
      // 左
      for (let dy = -1; ; dy--) {
        if (y + dy < 0) break;
        if (!mask[x][y + dy]) {
          const distance = abs(dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x][y + dy];
          }
          break;
        }
      }
      // 右上
      for (let dy = 1, dx = 1; ; dy++, dx++) {
        if (y + dy > maxIndex) break;
        if (x + dx > maxIndex) break;
        if (!mask[x + dx][y + dy]) {
          const distance = abs(SQRT2 * dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + dx][y + dy];
          }
          break;
        }
      }
      // 左上
      for (let dy = -1, dx = 1; ; dy--, dx++) {
        if (y + dy < 0) break;
        if (x + dx > maxIndex) break;
        if (!mask[x + dx][y + dy]) {
          const distance = abs(SQRT2 * dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + dx][y + dy];
          }
          break;
        }
      }
      // 右下
      for (let dy = 1, dx = -1; ; dy++, dx--) {
        if (y + dy > maxIndex) break;
        if (x + dx < 0) break;
        if (!mask[x + dx][y + dy]) {
          const distance = abs(SQRT2 * dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + dx][y + dy];
          }
          break;
        }
      }
      // 左下
      for (let dy = -1, dx = -1; ; dy--, dx--) {
        if (y + dy < 0) break;
        if (x + dx < 0) break;
        if (!mask[x + dx][y + dy]) {
          const distance = abs(SQRT2 * dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + dx][y + dy];
          }
          break;
        }
      }

      return alti + offset * distanceToLand * factor;
    }),
  );

  progress?.clear();

  console.log(result.length, result[0].length);
  return result;
}
