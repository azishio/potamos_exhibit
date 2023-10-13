/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/naming-convention */

import { GPU } from "gpu.js";
import { NULL } from "../../constants.ts";
import { limit } from "../utils/math.ts";

function calcWeight(d: number, a: number): number {
  const D = Math.abs(d);
  if (D <= 1) return (a + 2) * D ** 3 - (a + 3) * D ** 2 + 1;
  if (D <= 2) return a * D ** 3 - 5 * a * D ** 2 + 8 * a * D - 4 * a;
  return 0;
}

export function bicubicMissingInterpolationGPU(
  data: number[][],
  a: number,
  overshootSuppression: number,
  nullAs = NULL,
): number[][] {
  const gpu = new GPU();
  const kernel = gpu
    .createKernel<
      [number[][]],
      {
        NULL: number;
        nullAs: number;
        maxIndex: number;
        a: number;
        overshootSuppression: number;
        MIN_SAFE_INTEGER: number;
        MAX_SAFE_INTEGER: number;
      }
      // eslint-disable-next-line @typescript-eslint/no-shadow
    >(function bicubicMissingInterpolationKernelFn(data) {
      const x = this.thread.y;
      const y = this.thread.x;

      const { maxIndex, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } = this.constants;
      // すでに値が存在したらそのまま返す
      if (data[x][y] !== this.constants.NULL) return data[x][y];

      let maxValue = MIN_SAFE_INTEGER;
      let minValue = MAX_SAFE_INTEGER;
      // 重み付き平均の重み*値
      let validNum = 0;
      // 重み付き平均の重みの合計
      let sumWeight = 0;

      for (let dx = -2; dx <= 2; dx++)
        for (let dy = -2; dy <= 2; dy++) {
          const value =
            data[limit(x + dx, maxIndex)][limit(y + dy, maxIndex)] ===
            this.constants.NULL
              ? nullAs
              : data[limit(x + dx, maxIndex)][limit(y + dy, maxIndex)];

          if (value !== this.constants.NULL) {
            const weight =
              calcWeight(dx === 0 ? 0 : Math.abs(dx) - 0.5, this.constants.a) *
              calcWeight(dy === 0 ? 0 : Math.abs(dy) - 0.5, this.constants.a);

            sumWeight += weight;
            validNum += value * weight;
            if (value > maxValue) maxValue = value;
            if (value < minValue) minValue = value;
          }
        }

      if (sumWeight === 0) return this.constants.NULL;

      // 1.1 は整数化を抑制するため
      const result = (validNum / 1.1 / sumWeight) * 1.1;
      const delta = maxValue - minValue;

      return result > minValue - delta * this.constants.overshootSuppression ||
        result < maxValue + delta * this.constants.overshootSuppression
        ? result
        : (maxValue + minValue) / 2;
    })
    .setOutput([data.length, data.length])
    .setConstants({
      NULL,
      nullAs,
      maxIndex: data.length - 1,
      a,
      overshootSuppression,
      MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
      MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    })
    .setFunctions([calcWeight, limit]);

  const result = kernel(data) as Float32Array[];

  return result.map((f32Arr) => Array.from(f32Arr));
}

export function bicubicUpSamplingGPU(
  scale: number,
  data: number[][],
  a: number,
  overshootSuppression: number,
): number[][] {
  const gpu = new GPU();

  const kernel = gpu
    .createKernel<
      [number[][]],
      {
        NULL: number;
        maxIndex: number;
        a: number;
        overshootSuppression: number;
        scale: number;
        MIN_SAFE_INTEGER: number;
        MAX_SAFE_INTEGER: number;
      }
      // eslint-disable-next-line @typescript-eslint/no-shadow
    >(function bicubicUpSamplingKernelFn(data) {
      const x = Math.floor(this.thread.y / this.constants.scale);
      const y = Math.floor(this.thread.x / this.constants.scale);

      const _x = this.thread.y % this.constants.scale;
      const _y = this.thread.x % this.constants.scale;

      const { maxIndex, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } = this.constants;
      let maxValue = MIN_SAFE_INTEGER;
      let minValue = MAX_SAFE_INTEGER;
      let validNum = 0;
      let sumWeight = 0;
      let count = 0;

      for (let dx = -1; dx <= 2; dx++)
        for (let dy = -1; dy <= 2; dy++) {
          const value = data[limit(x + dx, maxIndex)][limit(y + dy, maxIndex)];
          if (value !== this.constants.NULL) {
            const scaleM1 = this.constants.scale - 1;
            const weight =
              calcWeight(
                dx <= 0 ? -dx + _x / scaleM1 : dx - _x / scaleM1,
                this.constants.a,
              ) *
              calcWeight(
                dy <= 0 ? -dy + _y / scaleM1 : dy - _y / scaleM1,
                this.constants.a,
              );

            validNum += value * weight;
            sumWeight += weight;
            count++;
            if (value > maxValue) maxValue = value;
            if (value < minValue) minValue = value;
          }
        }

      if (count === 0) return this.constants.NULL;
      const delta = maxValue - minValue;

      const result = (validNum / 1.1 / sumWeight) * 1.1;

      return result > minValue - delta * this.constants.overshootSuppression ||
        result < maxValue + delta * this.constants.overshootSuppression
        ? result
        : ((maxValue + minValue) / 1.1 / 2) * 1.1;
    })
    .setOutput([data.length * scale, data.length * scale])
    .setConstants({
      NULL,
      maxIndex: data.length - 1,
      a,
      overshootSuppression,
      scale,
      MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
      MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    })
    .setFunctions([calcWeight, limit])
    .setOptimizeFloatMemory(true);

  const result = kernel(data) as Float32Array[];

  return result.map((f32Arr) => Array.from(f32Arr));
}
