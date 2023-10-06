type Item = {
  name: string;
  point: number;
  description: string;
  image: string;
};
export type ItemList = Item[];

export type ItemListWithFlag = (Item & { select: boolean })[];
