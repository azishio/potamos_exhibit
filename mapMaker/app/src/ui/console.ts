import process from "process";
import esm from "eastasianwidth";

/**
 * 標準出力の管理クラス
 * インスタンスごとに出力した内容の書き換えを支援する
 */
export default class Console {
  private controlledLines: Array<{ content: string; width: number }> = [];

  /**
   * インスタンスと同時に`this.log`を実行できます
   * @param text
   */
  constructor(text?: string) {
    if (text !== undefined) this.log(text);
  }

  /**
   * 単一の文字列のみ受け取る`console.log`のラッパー
   *
   * @param text 出力する文字列
   */
  log(text: string): void {
    this.controlledLines.push(
      ...text.split("\n").map((v) => ({ content: v, width: esm.length(v) })),
    );
    console.log(text);
  }

  /**
   * this.logにより出力された文字列を書き換える
   *
   * @param text 上書きする文字列
   * @param line 行の指定。負数の場合は後ろから。自動折返しは含めず、範囲外だった場合は何もしない。
   * @param withClear 行をクリアしてから出力する。falseにするとキャリッジリターンのみ
   */
  overwrite(text: string, line: number, withClear = true): void {
    const index = (() => {
      if (Number.isNaN(line) || line === Infinity) return null;

      const intLine = Math.floor(line);
      const i = intLine >= 0 ? intLine : this.controlledLines.length + intLine;

      if (i >= 0 && i < this.controlledLines.length) return i;
      return null;
    })();

    if (index !== null) {
      this.controlledLines[index] = {
        content: text,
        width: esm.length(text),
      };

      const movement = this.controlledLines
        .slice(index)
        .reduce(
          (pV, cV) => pV + Math.ceil(cV.width / process.stdout.columns),
          0,
        );

      Console.overwrite(text, movement, withClear);
    }
  }

  /**
   * this.logで出力された行をすべてクリアする
   */
  clear(): void {
    const clearLineNum = this.controlledLines.reduce(
      (pV, cV) => pV + Math.ceil(cV.width / process.stdout.columns),
      0,
    );
    Console.clear(clearLineNum);
    this.controlledLines = [];
  }

  /**
   * 指定した行数分コンソールの内容をクリアする
   * @param clearLineNum 行数。負数の場合はエラーをスローする（内部で`String.prototype.repeat()`を使用）
   */
  static clear(clearLineNum = 1): void {
    const MOVE_UP_AND_CLEAR = "\x1b[1A\x1b[2K";
    process.stdout.write(`${MOVE_UP_AND_CLEAR.repeat(clearLineNum)}\r`);
    process.stdout.write(`\r`);
  }

  /**
   * コンソールの指定した行を上書きする
   *
   * @param text 上書きする文字列
   * @param line 下から数え他行数。現在のキャレット位置が0
   * @param withClear 行をクリアしてから出力する。falseにするとキャリッジリターンのみ
   */
  static overwrite(text: string, line: number, withClear = true): void {
    const MOVE_UP = `\x1b[${line}A`;
    const MOVE_DOWN = `\x1b[${line}B`;

    process.stdout.write(MOVE_UP);
    if (withClear) process.stdout.write("\x1b[2K");
    process.stdout.write("\r");
    process.stdout.write(text);
    process.stdout.write(MOVE_DOWN);
    process.stdout.write("\r");
  }
}
