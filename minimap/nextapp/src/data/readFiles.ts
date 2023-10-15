import { join } from "path";
import fs from "fs";
import fsp from "fs/promises";
import { ZodType } from "zod";
import {
  Boundary,
  boundarySchema,
  DangerZones,
  dangerZonesSchema,
  Items,
  itemsSchema,
  lal0Schema,
  Shelters,
  sheltersSchema,
  StartPoints,
  startPointsSchema,
} from "@/@type/ImportTypes";
import { Vector2D } from "@/@type/Vector";

const baseDirPath = "/app";
const dataDirPath = join(baseDirPath, "data");

const cache = new Map<string, Object | Array>();
const readFile = async <T>(
  path: string,
  validator: ZodType<T>,
): Promise<T | undefined> => {
  const cashData = cache.get(path) as T | undefined;
  if (cashData !== undefined) return cashData;

  if (!fs.existsSync(path)) throw new Error(`${path}が存在しない`);

  const data = JSON.parse(await fsp.readFile(path, "utf-8"));

  const result = await validator.safeParseAsync(data);

  if (result.success) {
    cache.set(path, result.data);
    return result.data;
  }
  return undefined;
};

export const readDangerZone = async (): Promise<DangerZones> => {
  const path = join(dataDirPath, "dangerzone.json");
  return (await readFile(path, dangerZonesSchema)) ?? [];
};

export const readShelter = async (): Promise<Shelters> => {
  const path = join(dataDirPath, "shelter.json");
  const result = await readFile(path, sheltersSchema);
  if (result === undefined) throw new Error("shelter.jsonの形式が不正");
  return result;
};

export const readStartPoint = async (): Promise<StartPoints> => {
  const path = join(dataDirPath, "startpoint.json");
  const result = await readFile(path, startPointsSchema);
  if (result === undefined) throw new Error("startpoint.jsonの形式が不正");
  return result;
};

export const readBoundary = async (): Promise<Boundary> => {
  const path = join(dataDirPath, "boundary.json");
  const result = await readFile<Boundary>(path, boundarySchema);
  if (result === undefined) throw new Error("boundary.jsonの形式が不正");
  return result as Boundary;
};

export const readItems = async (): Promise<Items> => {
  const path = join(baseDirPath, "public/items.json");
  return (await readFile(path, itemsSchema)) ?? [];
};

export const readLAL0 = async (): Promise<Vector2D> => {
  const path = join(dataDirPath, "lal0.json");
  const result = await readFile(path, lal0Schema);
  if (result === undefined) throw new Error("lal0.jsonの形式が不正");
  return result as Vector2D;
};
