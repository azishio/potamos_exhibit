import z, { array, boolean, number, object, string } from "zod";

const coordinateSchema = array(number()).length(2);

export const dangerZonesSchema = array(
  object({
    time: number(),
    areas: array(array(coordinateSchema)),
  }),
);
export type DangerZones = z.infer<typeof dangerZonesSchema>;

export const sheltersSchema = array(
  object({ name: string(), coordinate: coordinateSchema }),
).min(1);
export type Shelters = z.infer<typeof sheltersSchema>;

export const startPointsSchema = array(coordinateSchema).min(1);
export type StartPoints = z.infer<typeof startPointsSchema>;

export const boundarySchema = object({
  top: number(),
  bottom: number(),
  left: number(),
  right: number(),
});
export type Boundary = z.infer<typeof boundarySchema>;

export const lal0Schema = coordinateSchema;
export type LAL0 = z.infer<typeof coordinateSchema>;

const item = {
  name: string(),
  point: number(),
  description: string(),
  image: string(),
};

export const itemsSchema = array(object(item));
export type Items = z.infer<typeof itemsSchema>;

export const itemsWithFlagSchema = array(object({ ...item, flag: boolean() }));
export type ItemsWithFlag = z.infer<typeof itemsWithFlagSchema>;
