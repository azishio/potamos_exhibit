import chalk from "chalk";
import Console from "./console.ts";

export default class Progress {
  private max = 0;

  // 現在の進行数
  private finished = 0;

  // 1つのBLOCKの1つの状態がもつ進行数
  private STATUS_WEIGHT = 0;

  // BLOCKの状態換算の進行度合い
  // current/blockWeightより算出できるが、前回の状態と比較して出力を制御するために保持する
  private status = 0;

  private readonly console;

  private readonly HEAD_STRING = chalk.gray("│  ");

  private readonly TILE_BLOCKS = [
    "⠀",
    "⢀",
    "⢁",
    "⢅",
    "⢥",
    "⢮",
    "⣞",
    "⣟",
    "⣿",
  ] as const;

  private readonly TILE_BLOCK_PAR_LINE = 20;

  private readonly BAR_BLOCKS = ["⡇", "⣿"] as const;

  private readonly BAR_BLOCK_PAR_LINE = 20;

  constructor(
    private readonly type: "tile" | "bar",
    private readonly name: string,
  ) {
    this.console = new Console();
  }

  init(max: number): void {
    this.max = max;

    this.STATUS_WEIGHT =
      this.type === "bar"
        ? max / (this.BAR_BLOCK_PAR_LINE * this.BAR_BLOCKS.length)
        : max /
          (this.TILE_BLOCK_PAR_LINE *
            (this.TILE_BLOCK_PAR_LINE / 4) *
            this.TILE_BLOCKS.length);

    this.console.log(
      `${this.HEAD_STRING + this.name}  ${this.finished} / ${this.max}`,
    );

    if (this.type === "bar") {
      this.console.log(`${this.HEAD_STRING}`);
    } else {
      this.console.log(
        `${this.HEAD_STRING}\n`.repeat(this.TILE_BLOCK_PAR_LINE / 4 - 1) +
          this.HEAD_STRING,
      );
    }
  }

  increment(): void {
    this.finished++;
    this.render();
  }

  clear(): void {
    this.console.clear();
  }

  private render(): void {
    const currentStatus = Math.floor(this.finished / this.STATUS_WEIGHT);

    if (this.status !== currentStatus) {
      this.status = currentStatus;

      this.console.overwrite(
        `${this.HEAD_STRING + this.name}  ${this.finished} / ${this.max}`,
        0,
        false,
      );

      if (this.type === "bar") {
        const { length: resolution } = this.BAR_BLOCKS;

        const fullBlock = this.BAR_BLOCKS[resolution - 1].repeat(
          Math.floor(currentStatus / resolution),
        );
        const lastBlock =
          this.BAR_BLOCKS[(currentStatus % resolution) - 1] ?? "";

        this.console.overwrite(
          this.HEAD_STRING + fullBlock + lastBlock,
          -1,
          false,
        );
      } else {
        const { length: resolution } = this.TILE_BLOCKS;
        const fullBlockNum = Math.floor(currentStatus / resolution);

        const fullLineNum = Math.floor(fullBlockNum / this.TILE_BLOCK_PAR_LINE);

        const currentLineStatus =
          currentStatus - fullLineNum * this.TILE_BLOCK_PAR_LINE * resolution;

        const currentLineFullBlock = this.TILE_BLOCKS[resolution - 1].repeat(
          Math.floor(currentLineStatus / resolution),
        );

        const lastBlock =
          this.TILE_BLOCKS[(currentStatus % resolution) - 1] ?? "";

        const text = this.HEAD_STRING + currentLineFullBlock + lastBlock;
        const index = 1 + fullLineNum;
        this.console.overwrite(text, index);

        // 次の行に行ったときに、前の行をすべて埋まった状態にする
        // maxが少ない場合、最後のblockが途中で止まることがあるため
        if (fullLineNum > 0 && fullBlockNum % this.TILE_BLOCK_PAR_LINE === 0) {
          const FULL_LINE =
            this.HEAD_STRING +
            this.TILE_BLOCKS[this.TILE_BLOCKS.length - 1].repeat(
              this.TILE_BLOCK_PAR_LINE,
            );
          this.console.overwrite(FULL_LINE, index - 1);
        }
      }
    }
  }
}
