import fs from "graceful-fs";
import path from "path";
import { type Vector2D } from "../../../@types/Vector.ts";
import parallelTaskRunner from "../utils/parallelTaskRunner.ts";
import singleTaskRunner from "../utils/singleTaskRunner.ts";
import type Progress from "../../../ui/progress.ts";

const invalidTile: Array<{
  tile: string;
  status: number;
  statusText: string;
}> = [];

/**
 * 指定されたタイルを取得して書き出す
 *
 * @param baseURL `${x}/${y}`の手前までのURL
 * @param tileXY タイル座標
 * @param extension `${x}/${y}`の後の拡張子部分
 * @param writeDirPath 結果を書き込むディレクトリ
 */
async function fetchAndWrite(
  baseURL: string,
  tileXY: Vector2D,
  extension: string,
  writeDirPath: string,
): Promise<void> {
  const [x, y] = tileXY;

  const res = await fetch(`${baseURL}${x}/${y}${extension}`);

  if (res.ok) {
    const obj = await res.json();

    fs.writeFileSync(
      path.join(writeDirPath, `${x}_${y}${extension}`),
      JSON.stringify(obj),
    );
  } else {
    invalidTile.push({
      tile: `${x}_${y}`,
      status: res.status,
      statusText: res.statusText,
    });
    if (res.status !== 404) {
      console.log("invalidTiles:");
      console.dir(invalidTile, { depth: null });
      console.log("Response");
      console.dir(res, { depth: null });
      throw new Error("not OK");
    }
  }
}

export default async function fetchAndWriteTiles(
  baseURL: string,
  tiles: Vector2D[],
  extension: string,
  writeDirPath: string,
  option?: {
    overwrite?: boolean;
    parallelNumber?: number;
    progress?: Progress;
  },
): Promise<void> {
  const overwrite = option?.overwrite ?? false;
  const parallelNumber = option?.parallelNumber ?? 1;

  const existTileList = new Set(overwrite ? [] : fs.readdirSync(writeDirPath));
  const nonExistTileList = tiles.filter(
    ([x, y]) => !existTileList.has(`${x}_${y}${extension}`),
  );

  if (option?.progress?.init !== undefined)
    option?.progress?.init(nonExistTileList.length);

  // 1つのタイルをfetchして書き込み
  const callback = async (tile: Vector2D): Promise<void> => {
    if (option?.progress?.increment !== undefined)
      option?.progress?.increment();

    await fetchAndWrite(baseURL, tile, extension, writeDirPath);
  };

  if (parallelNumber <= 1) {
    // タイルのfetchを順次実行する
    await singleTaskRunner<Vector2D, void>(nonExistTileList, callback);
  } else {
    // タイルのfetchを並行処理する
    await parallelTaskRunner<Vector2D, void>(
      nonExistTileList,
      callback,
      parallelNumber,
    );
  }

  if (option?.progress?.clear !== undefined) option?.progress?.clear();
}
