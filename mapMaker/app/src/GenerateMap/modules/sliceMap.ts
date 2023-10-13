import { type MapInfo, type SlicedMap } from "../../@types/Map.ts";
import { type Vector2D } from "../../@types/Vector.ts";

/* 考え方メモ
 *
 * 一番左上のmapの左上の頂点は[0, 0]にあり、他のマップと共有できない。
 * 一番左上のmapのサイズが8001だとすると、右下は[8000, 8000]
 * 辺の頂点を共有しているので、つぎに4001のmapを配置したとすると、右下は12000, 12000]
 * さらに2001のmapを配置すると右下は[14000, 14000]
 *
 *       0              8000   12000 14000
 *     0 ┼───────────────┼───────┼───┤
 *       │               │       ├───┤
 *       │               ├───────┼───┤
 *       │               │       ├───┤
 * 8000  ┼───────┬───────┼───────┼───┤
 *       │       │       │       ├───┤
 * 12000 ┼───┬───┼───┬───┼───┬───┼───┤
 * 14000 ┴───┴───┴───┴───┴───┴───┴───┘
 *                                                 [8000       ~4001~     12000]
 *  [0                     ~8001~                   8000]                 [12000 ~2001~ 14000]
 *   └───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴
 */

export default function sliceMap(
  sourceMap: number[][],
  mapInfo: MapInfo,
): SlicedMap[] {
  const { nums } = mapInfo.tile;

  const size = [8001, 4001, 2001, 1001] as const;
  // 切り出す8001/4001/2001/1001サイズのタイルの左上の座標一覧
  const mapLT: [Vector2D[], Vector2D[], Vector2D[], Vector2D[]] = [
    [],
    [],
    [],
    [],
  ];

  // 切り取り終わった領域の右下
  let rb = 0;

  // 切り出すmapの左上頂点を配列に入れる
  // 各mapは辺を共有する
  nums.forEach((num, mapIndex) => {
    const sizeM1 = size[mapIndex] - 1;

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < Math.floor(rb / sizeM1); j++)
        mapLT[mapIndex].push([rb, j * sizeM1], [j * sizeM1, rb]);

      // 対角要素
      mapLT[mapIndex].push([rb, rb]);

      rb += sizeM1;
    }
  });

  // 左上頂点座標とサイズに従ってmapを切り出す
  return mapLT.flatMap((tlList, mapIndex) =>
    tlList.map((lt): SlicedMap => {
      const [left, top] = lt;
      return {
        lt,
        data: sourceMap
          .slice(top, top + size[mapIndex])
          .map((v) => v.slice(left, left + size[mapIndex])),
      };
    }),
  );
}
