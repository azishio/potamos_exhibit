import { Model, model, models, Schema } from "mongoose";

export interface ICoordinate {
  coordinate: [number, number];
  createdAt: Date;
}

const coordinateSchema = new Schema<ICoordinate>(
  {
    coordinate: [Number],
  },
  { toObject: { minimize: true } },
);

export const Coordinate: Model<ICoordinate> =
  models.Coordinate || model("Coordinate", coordinateSchema);

export interface IGameEvent {
  event: string;
  coordinate: { x: number; y: number; z: number };
}

const gameEventSchema = new Schema<IGameEvent>(
  {
    event: { type: String, required: true },
    coordinate: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },
  },
  { toObject: { minimize: true }, timestamps: true },
);

export const GameEvent: Model<IGameEvent> =
  models.GameEvent || model("GameEvent", gameEventSchema);

export interface IGameInfo {
  nickname: string;
  items: string[];
}

const gameInfoSchema = new Schema<IGameInfo>({
  nickname: { type: String, required: true },
  items: { type: [String], required: true },
});

export const GameInfo: Model<IGameInfo> =
  models.GameInfo || model("GameInfo", gameInfoSchema);
