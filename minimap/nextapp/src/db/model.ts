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
  createdAt: Date;
}

const gameEventSchema = new Schema<IGameEvent>(
  {
    event: { type: String, required: true },
    coordinate: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },
    createdAt: Date,
  },
  { toObject: { minimize: true }, timestamps: true },
);

export const GameEvent: Model<IGameEvent> =
  models.GameEvent || model("GameEvent", gameEventSchema);

export interface IItems {
  items: string[];
}

const itemsSchema = new Schema<IItems>({
  items: { type: [String], required: true },
});

export const Items: Model<IItems> = models.Items || model("Items", itemsSchema);

export interface INickname {
  name: string;
}

const nicknameSchema = new Schema<INickname>({
  name: { type: String, required: true },
});

export const Nickname: Model<INickname> =
  models.Nickname || model("Nickname", nicknameSchema);
