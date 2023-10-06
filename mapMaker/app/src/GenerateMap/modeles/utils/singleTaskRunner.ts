class SingleTaskRunnerError extends Error {
  static {
    this.prototype.name = "SingleTaskRunnerError";
  }
  constructor(
    err: any,
    public usedData: any,
  ) {
    super(typeof err === "string" ? err : undefined);
    if (err instanceof Error) {
      this.stack = err.stack;
      this.message = err.message;
    }
  }
}

/**
 * 与えられたdataListの順で順次処理する
 *
 * @param dataList callbackに渡されるデータの配列
 * @param callback dataListの各要素を使った非同期処理
 * @param throwError エラーをthrowするか否か
 */
export default async function singleTaskRunner<T, U>(
  dataList: Array<T>,
  callback: (usingData: T, index: number, dataList: T[]) => Promise<U>,
  throwError = true,
) {
  const result: U[] = [];
  await dataList.reduce(async (p, usingData, index) => {
    await p;

    try {
      result.push(await callback(usingData, index, dataList));
    } catch (err) {
      if (throwError) throw new SingleTaskRunnerError(err, usingData);
      else {
        console.log(`SingleTaskRunnerERROR usedData:`);
        console.dir(usingData, { depth: null });
      }
    }
  }, Promise.resolve());

  return result;
}
