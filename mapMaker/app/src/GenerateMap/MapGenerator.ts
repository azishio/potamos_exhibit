import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import getMapInfo from "./modeles/getMapInfo.ts";
import plotDataToArray from "./modeles/plotDataToArray.ts";
import fetchAndWriteTiles from "./modeles/io/fetchAndWriteTiles.ts";
import readDEM5Files from "./modeles/io/readDEM5Files.ts";
import {
  akimaMissingInterpolation,
  akimaUpSampling,
} from "./modeles/interpolation/akima.ts";
import sliceMap from "./modeles/sliceMap.ts";
import { binarization, boolTo01 } from "./modeles/utils/math.ts";
import {
  CAN_OUPTUP_PNG_MAX_LENGTH,
  NULL,
  UINT16ARRAY_MAX_NUM,
} from "./constants.ts";
import {
  bilinearMissingInterpolation,
  bilinearUpSampling,
} from "./modeles/interpolation/bilinear.ts";
import readPointsFile from "./modeles/io/readPointsFile.ts";
import map2D from "./modeles/utils/map2D.ts";
import encodePNG from "./modeles/utils/encodePNG.ts";
import normalizationUint16 from "./modeles/normalizationUint16.ts";
import {
  bicubicMissingInterpolation,
  bicubicUpSampling,
} from "./modeles/interpolation/bicubic.ts";
import makeDepression from "./modeles/interpolation/makeDepression.ts";
import size2D from "./modeles/utils/size2D.ts";
import type Progress from "../ui/progress.ts";
import { type SystemCode, type Vector2D } from "../@types/Vector.ts";
import { type MapInfo } from "../@types/Map.ts";
import makeDepressionGPU from "./modeles/interpolation/makeDepressionGPU.ts";
import {
  bilinearMissingInterpolationGPU,
  bilinearUpSamplingGPU,
} from "./modeles/interpolation/bilinearGPU.ts";
import {
  bicubicMissingInterpolationGPU,
  bicubicUpSamplingGPU,
} from "./modeles/interpolation/bicubicGPU.ts";

export interface CallbackArg {
  maps: Map<string, number[][]>;
  masks: Map<string, boolean[][]>;
}

export default class MapGenerator {
  private readonly flag = { dataImported: false };

  private systemCode: SystemCode = 1;

  private mapInfo: MapInfo = {
    pointsAABB: { right: 0, left: 0, top: 0, bottom: 0 },
    mapAABB: { right: 0, left: 0, top: 0, bottom: 0 },
    paddingAABB: { right: 0, left: 0, top: 0, bottom: 0 },
    tile: {
      rect: { right: 0, left: 0, top: 0, bottom: 0 },
      list: [],
      nums: [0, 0, 0, 0],
    },
  };

  private readonly maps = new Map<string, number[][]>();

  private readonly masks = new Map<string, boolean[][]>();

  private readonly path;

  private readonly useGPU;

  constructor(
    {
      inputDirPath,
      outputDirPath,
      cacheDirPath,
    }: {
      inputDirPath: string;
      outputDirPath: string;
      cacheDirPath: string;
    },
    useGPU: boolean,
  ) {
    this.useGPU = useGPU;
    this.path = {
      inputDir: inputDirPath,
      outputDir: outputDirPath,
      cacheDEM5: path.join(cacheDirPath, "dem5"),
    };

    Object.values(this.path).forEach((dirPath) => {
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    });

    if (!fs.existsSync(path.join(inputDirPath, "points.json")))
      fs.writeFileSync(
        path.join(inputDirPath, "points.json"),
        JSON.stringify(
          {
            systemCode: 9,
            coordinates: [[139.5422, 37.2447]],
          },
          null,
          2,
        ),
      );
  }

  async setPoints(
    points: Vector2D[],
    systemCode: SystemCode,
    progress?: Progress,
  ): Promise<this> {
    if (this.flag.dataImported)
      throw Error("すでにデータはインポートされています");
    this.flag.dataImported = true;

    this.mapInfo = getMapInfo(points, systemCode);
    this.systemCode = systemCode;

    await fetchAndWriteTiles(
      `https://cyberjapandata.gsi.go.jp/xyz/experimental_dem5a/18/`,
      this.mapInfo.tile.list,
      ".geojson",
      this.path.cacheDEM5,
      {
        parallelNumber: 5,
        progress,
      },
    );

    const demData = await readDEM5Files(this.path.cacheDEM5, this.mapInfo);

    const { altiMap, waterMask } = plotDataToArray(
      demData,
      this.mapInfo,
      this.systemCode,
    );

    this.maps.set("alti", altiMap);
    this.maps.set("initial", structuredClone(altiMap));
    this.masks.set("water", waterMask);

    return this;
  }

  async setPointsByFile(progress?: Progress): Promise<this> {
    const { coordinates, systemCode } = await readPointsFile(
      path.join(this.path.inputDir, "points.json"),
    );

    return this.setPoints(coordinates, systemCode, progress);
  }

  // 処理を挟む
  insertCallback(fn: (arg: CallbackArg) => void): this {
    this.checkValidation();

    fn({
      maps: this.maps,
      masks: this.masks,
    });

    return this;
  }

  async insertCallbackAsync(
    fn: (arg: CallbackArg) => Promise<void>,
  ): Promise<this> {
    this.checkValidation();

    await fn({
      masks: this.masks,
      maps: this.maps,
    });

    return this;
  }

  // 欠損補間
  mapMissingInterpolation(
    keys: string[],
    param:
      | { algorithm: "bilinear" }
      | { algorithm: "bicubic"; a: number; overshootSuppression: number }
      | { algorithm: "akima"; overshootSuppression: number },
    newKeys?: string[],
    progress?: Progress,
  ): this {
    this.checkValidation();

    const { algorithm } = param;

    keys.forEach((key, i) => {
      const map = this.maps.get(key);
      if (!MapGenerator.isValidMap(map)) return;

      this.maps.set(
        newKeys?.at(i) ?? key,
        ((v: number[][]): number[][] => {
          if (algorithm === "akima")
            return akimaMissingInterpolation(
              v,
              param.overshootSuppression,
              NULL,
              progress,
            );

          if (algorithm === "bicubic")
            return this.useGPU
              ? bicubicMissingInterpolationGPU(
                  v,
                  param.a,
                  param.overshootSuppression,
                  NULL,
                )
              : bicubicMissingInterpolation(
                  v,
                  param.a,
                  param.overshootSuppression,
                  NULL,
                  progress,
                );

          if (algorithm === "bilinear")
            return this.useGPU
              ? bilinearMissingInterpolationGPU(v)
              : bilinearMissingInterpolation(v, NULL, progress);

          return v;
        })(map),
      );
    });

    return this;
  }

  maskMissingInterpolation(
    keys: string[],
    threshold: number,
    param:
      | { algorithm: "bilinear" }
      | { algorithm: "bicubic"; a: number; overshootSuppression: number }
      | { algorithm: "akima"; overshootSuppression: number },
    newKeys?: string[],
    progress?: Progress,
  ): this {
    this.checkValidation();
    const { algorithm } = param;

    keys.forEach((key, i) => {
      const mask = this.masks.get(key);
      if (!MapGenerator.isValidMask(mask)) return;

      this.masks.set(
        newKeys?.at(i) ?? key,
        binarization(
          ((v: number[][]): number[][] => {
            if (algorithm === "akima")
              return akimaMissingInterpolation(
                v,
                param.overshootSuppression,
                NULL,
                progress,
              );

            if (algorithm === "bicubic")
              return this.useGPU
                ? bicubicMissingInterpolationGPU(
                    v,
                    param.a,
                    param.overshootSuppression,
                    NULL,
                  )
                : bicubicMissingInterpolation(
                    v,
                    param.a,
                    param.overshootSuppression,
                    NULL,
                    progress,
                  );

            if (algorithm === "bilinear")
              return this.useGPU
                ? bilinearMissingInterpolationGPU(v)
                : bilinearMissingInterpolation(v, NULL, progress);

            return v;
          })(boolTo01(mask)),
          threshold,
        ),
      );
    });

    return this;
  }

  /**
   * 内水面の標高を以下の式に沿って決定する
   *
   * (h - {offset}*d/{factor})
   *
   * d:45°間隔で探索した陸地まで（水面でない部分）の最短距離距離
   *
   * h:dを決定する際に採用された点の標高
   */
  makeDepression(
    name: string,
    mapKey: string,
    maskKey: string,
    offset: number,
    factor: number,
    progress?: Progress,
  ): this {
    this.checkValidation();
    const map = this.maps.get(mapKey);
    const mask = this.masks.get(maskKey);
    if (!MapGenerator.isValidMask(mask) || !MapGenerator.isValidMap(map))
      return this;

    this.maps.set(
      name,
      this.useGPU
        ? makeDepressionGPU(map, mask, offset, factor)
        : makeDepression(map, mask, offset, factor, progress),
    );

    return this;
  }

  overlayMap(
    name: string,
    baseMapKey: string,
    sourceMapKey: string,
    sourceMaskKey: string,
    progress?: Progress,
  ): this {
    this.checkValidation();

    const baseMap = this.maps.get(baseMapKey);
    const sourceMap = this.maps.get(sourceMapKey);
    const sourceMask = this.masks.get(sourceMaskKey);

    if (
      !MapGenerator.isValidMap(baseMap) ||
      !MapGenerator.isValidMap(sourceMap) ||
      !MapGenerator.isValidMask(sourceMask)
    )
      return this;

    progress?.init(size2D(sourceMask));

    this.maps.set(
      name,
      map2D(sourceMask, (v, x, y) => {
        progress?.increment();
        return v && sourceMap[x][y] !== NULL ? sourceMap[x][y] : baseMap[x][y];
      }),
    );

    progress?.clear();

    return this;
  }

  // アップサンプリング系
  upSampling(
    scale: number,
    mapsParam:
      | { algorithm: "bilinear" }
      | { algorithm: "bicubic"; a: number; overshootSuppression: number }
      | { algorithm: "akima"; overshootSuppression: number },
    maskParam:
      | { algorithm: "bilinear"; threshold: number }
      | {
          algorithm: "bicubic";
          a: number;
          overshootSuppression: number;
          threshold: number;
        }
      | { algorithm: "akima"; overshootSuppression: number; threshold: number },
    progress?: {
      maps?: Array<{ key: string; progress: Progress }>;
      masks?: Array<{ key: string; progress: Progress }>;
    },
  ): this {
    this.checkValidation();

    {
      const { algorithm } = mapsParam;

      [...this.maps.keys()]
        .filter((v) => v !== "initial")
        .forEach((key) => {
          if (!this.maps.has(key)) return;
          const progressFn = progress?.maps?.find((V) => V.key === key)
            ?.progress;

          this.maps.set(
            key,
            ((v: number[][]): number[][] => {
              if (algorithm === "akima")
                return akimaUpSampling(
                  scale,
                  v,
                  mapsParam.overshootSuppression,
                  progressFn,
                );

              if (algorithm === "bicubic")
                return this.useGPU
                  ? bicubicUpSamplingGPU(
                      scale,
                      v,
                      mapsParam.a,
                      mapsParam.overshootSuppression,
                    )
                  : bicubicUpSampling(
                      scale,
                      v,
                      mapsParam.a,
                      mapsParam.overshootSuppression,
                      progressFn,
                    );

              if (algorithm === "bilinear")
                return this.useGPU
                  ? bilinearUpSamplingGPU(scale, v)
                  : bilinearUpSampling(scale, v, progressFn);

              return v;
            })(this.maps.get(key)!),
          );
        });
    }
    {
      const { algorithm, threshold } = maskParam;

      [...this.masks.keys()].forEach((key) => {
        if (!this.masks.has(key)) return;
        const progressFn = progress?.masks?.find((V) => V.key === key)
          ?.progress;

        this.masks.set(
          key,
          binarization(
            ((v: number[][]): number[][] => {
              if (algorithm === "akima")
                return akimaUpSampling(
                  scale,
                  v,
                  maskParam.overshootSuppression,
                  progressFn,
                );

              if (algorithm === "bicubic") {
                return this.useGPU
                  ? bicubicUpSamplingGPU(
                      scale,
                      v,
                      maskParam.a,
                      maskParam.overshootSuppression,
                    )
                  : bicubicUpSampling(
                      scale,
                      v,
                      maskParam.a,
                      maskParam.overshootSuppression,
                      progressFn,
                    );
              }

              if (algorithm === "bilinear")
                return this.useGPU
                  ? bilinearUpSamplingGPU(scale, v)
                  : bilinearUpSampling(scale, v, progressFn);

              return v;
            })(boolTo01(this.masks.get(key)!)),
            threshold,
          ),
        );
      });
    }

    return this;
  }

  async outputMaps(
    list: Array<{ fileName: string; mapKey: string; maskKeys: string[] }>,
  ): Promise<this> {
    this.checkValidation();
    await Promise.all(
      list.map(async ({ fileName, mapKey, maskKeys }): Promise<void> => {
        const targetMap = this.maps.get(mapKey);
        if (!MapGenerator.isValidMap(targetMap)) return;
        if (targetMap.length > CAN_OUPTUP_PNG_MAX_LENGTH) return;

        const filteredMap = Array.from({ length: targetMap.length }, (_, x) =>
          Array.from({ length: targetMap[0].length }, (__, y) => {
            const isMasked = maskKeys.some((key) => {
              const mask = this.masks.get(key);
              if (!MapGenerator.isValidMask(mask)) return false;

              if (mask === undefined) return false;
              return mask[x][y];
            });

            return isMasked ? NULL : targetMap[x][y];
          }),
        );

        await fsp.writeFile(
          path.join(this.path.outputDir, `${fileName}_alti.png`),
          encodePNG(filteredMap),
        );
      }),
    );

    return this;
  }

  async outputAllMaps(): Promise<this> {
    this.checkValidation();
    await Promise.all(
      [...this.maps.keys()].map(async (key): Promise<void> => {
        const targetMap = this.maps.get(key);
        if (!MapGenerator.isValidMap(targetMap)) return;
        if (targetMap.length > CAN_OUPTUP_PNG_MAX_LENGTH) return;

        const { normalizedMap } = normalizationUint16(targetMap);

        await fsp.writeFile(
          path.join(this.path.outputDir, `map_${key}.png`),
          encodePNG(normalizedMap),
        );
      }),
    );

    await Promise.all(
      [...this.masks.keys()].map(async (key): Promise<void> => {
        const targetMask = this.masks.get(key);
        if (!MapGenerator.isValidMask(targetMask)) return;
        if (targetMask.length > CAN_OUPTUP_PNG_MAX_LENGTH) return;

        const normalizedMap = map2D(targetMask, (v) =>
          v ? UINT16ARRAY_MAX_NUM : 0,
        );

        await fsp.writeFile(
          path.join(this.path.outputDir, `mask_${key}.png`),
          encodePNG(normalizedMap),
        );
      }),
    );

    return this;
  }

  async outputSlicedMaps(mapKey: string, dirName: string): Promise<this> {
    this.checkValidation();

    const map = this.maps.get(mapKey);
    if (!MapGenerator.isValidMap(map)) return this;

    const dirPath = path.join(this.path.outputDir, dirName);
    if (!fs.existsSync(dirPath)) await fsp.mkdir(dirPath, { recursive: true });

    const { min, zScale, normalizedMap } = normalizationUint16(map);
    const slicedMaps = sliceMap(normalizedMap, this.mapInfo);

    await Promise.all(
      slicedMaps.map(async ({ data, lt: [y, x] }) => {
        await fsp.writeFile(
          path.join(dirPath, `${y}_${x}.png`),
          encodePNG(data),
        );
      }),
    );
    await fsp.writeFile(
      path.join(dirPath, "info.json"),
      JSON.stringify({ min, zScale }, null, 2),
    );
    return this;
  }

  // 状態の整合性チェック
  private checkValidation(): void {
    if (!this.flag.dataImported)
      throw new Error(
        "データがインポートされていません。`setPoint()`もしくは、`setPointByFile()`メソッドを先に呼ぶ必要があります",
      );
  }

  private static isValidMask(
    usingMask: boolean[][] | undefined,
  ): usingMask is boolean[][] {
    if (usingMask !== undefined)
      usingMask.forEach((v) => {
        if (v === undefined) throw new Error(`指定されたmaskは存在しません`);
      });

    return true;
  }

  private static isValidMap(
    usingMap: number[][] | undefined,
  ): usingMap is number[][] {
    if (usingMap !== undefined)
      usingMap.forEach((v) => {
        if (v === undefined) throw new Error(`指定されたmapは存在しません`);
      });
    return true;
  }
}
