declare module "eastasianwidth" {
  export function eastAsianWidth(
    character: string,
  ): "F" | "H" | "W" | "Na" | "A" | "N";
  export function characterLength(character: string): number;
  export function length(string: string): number;
  export function slice(text: string, start?: number, end?: number): string;
}
