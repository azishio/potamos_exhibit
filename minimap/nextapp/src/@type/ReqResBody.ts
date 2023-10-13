import z, { array, boolean, number, object, string } from "zod";

export const initReqBodySchema = object({
  nickname: string(),
  item: array(string()),
});
export type InitReqBody = z.infer<typeof initReqBodySchema>;

const coordinateSchema = array(number()).length(2);

export const lastStateResBodySchema = object({
  coordinate: coordinateSchema,
  currentDangerZone: array(array(coordinateSchema)),
  preDangerZone: array(array(coordinateSchema)),
  continue: boolean(),
});
export type LastStateResBody = z.infer<typeof lastStateResBodySchema>;
