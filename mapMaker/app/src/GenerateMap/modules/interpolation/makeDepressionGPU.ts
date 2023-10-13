import { GPU } from "gpu.js";
import { NULL, SQRT2 } from "../../constants.ts";
import map2D from "../utils/map2D.ts";

/* eslint-disable @typescript-eslint/naming-convention */
export default function makeDepressionGPU(
  map: number[][],
  mask: boolean[][],
  offset: number,
  factor: number,
): number[][] {
  const gpu = new GPU();
  const kernel = gpu
    .createKernel<
      [mask: number[][], map: number[][]],
      {
        offset: number;
        factor: number;
        MAX_SAFE_INTEGER: number;
        NULL: number;
        SQRT2: number;
      }
      // eslint-disable-next-line @typescript-eslint/no-shadow
    >(function makeDepressionGPUKernelFn(mask, map) {
      const x = this.thread.y;
      const y = this.thread.x;
      const maxIndex = this.output.x - 1;
      if (mask[x][y] === 0) return this.constants.NULL;

      let distanceToLand = this.constants.MAX_SAFE_INTEGER;
      let alti = 0;

      // 上
      for (let t_dx = 1; ; t_dx++) {
        if (x + t_dx > maxIndex) break;
        if (mask[x + t_dx][y] === 0) {
          const distance = Math.abs(t_dx);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + t_dx][y];
          }
          break;
        }
      }
      // 下
      for (let b_dx = -1; ; b_dx--) {
        if (x + b_dx < 0) break;
        if (mask[x + b_dx][y] === 0) {
          const distance = Math.abs(b_dx);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + b_dx][y];
          }
          break;
        }
      }
      // 右
      for (let r_dy = 1; ; r_dy++) {
        if (y + r_dy > maxIndex) break;
        if (mask[x][y + r_dy] === 0) {
          const distance = Math.abs(r_dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x][y + r_dy];
          }
          break;
        }
      }
      // 左
      for (let l_dy = -1; ; l_dy--) {
        if (y + l_dy < 0) break;
        if (mask[x][y + l_dy] === 0) {
          const distance = Math.abs(l_dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x][y + l_dy];
          }
          break;
        }
      }
      // 右上
      for (let rt_dy = 1, rt_dx = 1; ; rt_dy++, rt_dx++) {
        if (y + rt_dy > maxIndex) break;
        if (x + rt_dx > maxIndex) break;
        if (mask[x + rt_dx][y + rt_dy] === 0) {
          const distance = Math.abs(this.constants.SQRT2 * rt_dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + rt_dx][y + rt_dy];
          }
          break;
        }
      }
      // 左上
      for (let lt_dy = -1, lt_dx = 1; ; lt_dy--, lt_dx++) {
        if (y + lt_dy < 0) break;
        if (x + lt_dx > maxIndex) break;
        if (mask[x + lt_dx][y + lt_dy] === 0) {
          const distance = Math.abs(this.constants.SQRT2 * lt_dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + lt_dx][y + lt_dy];
          }
          break;
        }
      }
      // 右下
      for (let rb_dy = 1, rb_dx = -1; ; rb_dy++, rb_dx--) {
        if (y + rb_dy > maxIndex) break;
        if (x + rb_dx < 0) break;
        if (mask[x + rb_dx][y + rb_dy] === 0) {
          const distance = Math.abs(this.constants.SQRT2 * rb_dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + rb_dx][y + rb_dy];
          }
          break;
        }
      }
      // 左下
      for (let lb_dy = -1, lb_dx = -1; ; lb_dy--, lb_dx--) {
        if (y + lb_dy < 0) break;
        if (x + lb_dx < 0) break;
        if (mask[x + lb_dx][y + lb_dy] === 0) {
          const distance = Math.abs(this.constants.SQRT2 * lb_dy);
          if (distance < distanceToLand) {
            distanceToLand = distance;
            alti = map[x + lb_dx][y + lb_dy];
          }
          break;
        }
      }

      return (
        alti + this.constants.offset * distanceToLand * this.constants.factor
      );
    })
    .setOutput([map.length, map.length])
    .setConstants({
      factor,
      offset,
      MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
      NULL,
      SQRT2,
    });

  const result = kernel(
    map2D(mask, (v) => (v ? 1 : 0)),
    map,
  ) as Float32Array[];

  return result.map((f32Arr) => Array.from(f32Arr));
}
