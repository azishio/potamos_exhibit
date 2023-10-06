class ParallelTaskRunnerError extends Error {
  static {
    this.prototype.name = "ParallelTaskRunnerError";
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
 * 指定された数だけTaskRunnerを起動し、dataListの値を使って並行処理する。
 *
 * @param dataList callbackに渡されるデータの配列
 * @param callback dataListの各要素を使った非同期処理
 * @param parallelNum TaskRunnerの起動数
 * @param throwError エラーをthrowするか否か
 */
export default async function parallelTaskRunner<T, U>(
  dataList: T[],
  callback: (usingData: T, index: number, dataList: T[]) => Promise<U>,
  parallelNum = 1,
  throwError = true,
): Promise<U[]> {
  const taskNum = dataList.length;
  let loadedTaskIndex = 0;

  const result: U[] = [];

  const taskRunners = Array.from({ length: parallelNum }, async () => {
    while (loadedTaskIndex < taskNum) {
      const usingData = dataList[loadedTaskIndex++];

      try {
        result.push(await callback(usingData, loadedTaskIndex, dataList));
      } catch (err) {
        if (throwError) throw new ParallelTaskRunnerError(err, usingData);
        else {
          console.log(`SingleTaskRunnerERROR usedData:`);
          console.dir(usingData, { depth: null });
        }
      }
    }
  });
  await Promise.all(taskRunners);

  return result;
}
