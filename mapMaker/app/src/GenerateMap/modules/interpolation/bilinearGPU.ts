/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/naming-convention */

import { GPU } from "gpu.js";
import { NULL } from "../../constants.ts";
import { limit } from "../utils/math.ts";

export function bilinearMissingInterpolationGPU(
  data: number[][],
  nullAs = NULL,
): number[][] {
  console.log(data.length);

  const gpu = new GPU();
  const kernel = gpu
    .createKernel<
      [number[][]],
      { NULL: number; nullAs: number; maxIndex: number }
    >(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      function bilinearMissingInterpolationKernelFn(data) {
        const x = this.thread.y;
        const y = this.thread.x;
        const { maxIndex } = this.constants;

        // すでに値が存在したらそのまま帰す
        if (data[x][y] !== this.constants.NULL) return data[x][y];

        let validNum = 0;
        let count = 0;

        // 隣接する要素がNULLでなければvalidNumに入れる
        for (let xx = x - 1; xx <= x + 1; xx++)
          for (let yy = y - 1; yy <= y + 1; yy++) {
            if (xx === x && yy === y) continue;

            const value =
              data[limit(xx, maxIndex)][limit(yy, maxIndex)] ===
              this.constants.NULL
                ? this.constants.nullAs
                : data[limit(xx, maxIndex)][limit(yy, maxIndex)];
            if (value !== this.constants.NULL) {
              validNum += value;
              count++;
            }
          }

        if (count === 0) return this.constants.NULL;
        // 1.1は整数化対策
        return (validNum / 1.1 / count) * 1.1;
      },
    )
    .setOutput([data.length, data.length])
    .setConstants({
      NULL,
      nullAs,
      maxIndex: data.length - 1,
    })
    .setFunctions([limit]);

  const result = kernel(data) as Float32Array[];

  return result.map((f32Arr) => Array.from(f32Arr));
}
export function bilinearUpSamplingGPU(
  scale: number,
  data: number[][],
): number[][] {
  const gpu = new GPU();

  const kernel = gpu
    .createKernel<
      [number[][]],
      { NULL: number; scale: number; maxIndex: number }
    >(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      function bilinearUpSamplingKernelFn(data) {
        const x = Math.floor(this.thread.y / this.constants.scale);
        const y = Math.floor(this.thread.x / this.constants.scale);

        const _x = this.thread.y % this.constants.scale;
        const _y = this.thread.x % this.constants.scale;

        const { maxIndex } = this.constants;

        let validNum = 0;
        let sumWeight = 0;
        let count = 0;
        // 隣接する要素がNULLでなければvalidNumに入れる
        for (let dx = 0; dx <= 1; dx++)
          for (let dy = 0; dy <= 1; dy++) {
            const value =
              data[limit(x + dx, maxIndex)][limit(y + dy, maxIndex)];
            if (value !== this.constants.NULL) {
              const scaleM1 = this.constants.scale - 1;

              const weight = Math.abs(
                (dx + (_x / scaleM1 - 0.5)) * (dy + (_y / scaleM1 - 0.5)),
              );

              validNum += value * weight;
              sumWeight += weight;
              count++;
            }
          }

        if (count === 0) return this.constants.NULL;
        return (validNum / 1.1 / sumWeight) * 1.1;
      },
    )
    .setOutput([data.length * scale, data.length * scale])
    .setConstants({
      NULL,
      scale,
      maxIndex: data.length - 1,
    })
    .setFunctions([limit]);

  const result = kernel(data) as Float32Array[];

  return result.map((f32Arr) => Array.from(f32Arr));
}
