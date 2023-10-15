import { confirm, intro, outro } from "@clack/prompts";
import chalk from "chalk";
import path from "path";
import * as url from "url";
import header from "./text/header.ts";
import MapGenerator from "./GenerateMap/MapGenerator.ts";
import map2D from "./GenerateMap/modules/utils/map2D.ts";
import { NULL } from "./GenerateMap/constants.ts";
import Progress from "./ui/progress.ts";
import size2D from "./GenerateMap/modules/utils/size2D.ts";
import description from "./text/description.ts";

/**
 * 行頭文字列を追加する
 * @param text
 */
function insertHeadStr(text: string): string {
  // @clack/promptsに合わせた行頭文字列
  const HEAD_STRING = chalk.gray("│  ");
  return text
    .split("\n")
    .map((v) => HEAD_STRING + v)
    .join("\n");
}

function withProjectPath(str: string): string {
  return path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", str);
}

(async (): Promise<void> => {
  // 初期化
  const mapGenerator = new MapGenerator({
    inputDirPath: withProjectPath("/input"),
    outputDirPath: withProjectPath("/output"),
    cacheDirPath: withProjectPath("/cache"),
  });

  console.log(header);

  intro("Creating Files");

  if (
    await confirm({
      message: "使い方を読む？",
      active: "読む!",
      inactive: "読まない！(このまま開始)",
      initialValue: false,
    })
  ) {
    console.log(insertHeadStr(description));
    while (
      !(await confirm({
        message: "準備できた?",
        active: "できた！",
        inactive: "できてない...",
        initialValue: false,
      }))
    ) {}
  }

  console.log(`${chalk.green("o")}   処理開始`);

  const altiMapMissingInterpolationProgress = new Progress(
    "tile",
    "mapMissingInterpolation",
  );
  const generateWaterMaskProgress = new Progress("tile", "generateWaterMask");
  const waterMaskMissingInterpolationProgress = new Progress(
    "tile",
    "waterMaskMissingInterpolation",
  );
  const altiMapUpSamplingProgress = new Progress("tile", "altiMapUpSampling ");
  const waterMaskUpSamplingProgress = new Progress(
    "tile",
    "waterMaskUpSampling ",
  );
  const makeDepressionProgress = new Progress("tile", "makeDepression");

  // データフェッチ
  const demFetchProgress = new Progress("tile", "demTileFetch");
  const fgdFetchProgress = new Progress("tile", "fgdTileFetch");
  const rdclFetchProgress = new Progress("tile", "rdclTileFetch");
  await mapGenerator.setPointsByFile({
    dem5: demFetchProgress,
    fgd: fgdFetchProgress,
    rdcl: rdclFetchProgress,
  });

  // 計算
  mapGenerator
    .mapMissingInterpolation(
      ["alti"],
      { algorithm: "bilinear" },
      ["alti"],
      altiMapMissingInterpolationProgress,
    )
    .insertCallback(({ maps, masks }) => {
      const waterMask = masks.get("water")!;
      const bilinearInterpolatedAltiMap = maps.get("alti")!;
      generateWaterMaskProgress.init(size2D(waterMask));
      masks.set(
        "water",
        map2D(waterMask, (v, x, y) => {
          generateWaterMaskProgress.increment();
          return !v && bilinearInterpolatedAltiMap[x][y] === NULL ? true : v;
        }),
      );
      generateWaterMaskProgress.clear();
    });

  mapGenerator.upSampling(
    5,
    { algorithm: "bicubic", a: -0.5, overshootSuppression: 3 },
    {
      algorithm: "bilinear",
      threshold: 0.6,
    },
    {
      maps: [{ key: "alti", progress: altiMapUpSamplingProgress }],
      masks: [{ key: "water", progress: waterMaskUpSamplingProgress }],
    },
  );
  mapGenerator
    .maskMissingInterpolation(
      ["water"],
      0.9,
      {
        algorithm: "bilinear",
      },
      ["water"],
      waterMaskMissingInterpolationProgress,
    )
    .makeDepression(
      "depression",
      "alti",
      "water",
      -50,
      0.01,
      makeDepressionProgress,
    )
    .overlayMap("new", "alti", "depression", "water");

  await mapGenerator.outputAllMaps();

  // output
  await mapGenerator.outputSlicedMaps("new", "sliced");
  mapGenerator.outputInfo();
  mapGenerator.outputBldgObj();
  // mapGenerator.outputRoadObj();

  outro("処理完了！ outputディレクトリを確認してください");
})();
