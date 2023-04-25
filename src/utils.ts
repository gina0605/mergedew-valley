export const array2d = (h: number, w: number, x: any) =>
  Array(h)
    .fill(0)
    .map(() => Array(w).fill(x));

export const betterParseInt = (x: string) => (x === "" ? 0 : parseInt(x));

export const intoRange = (p: number[], r: number[]) => [
  Math.max(p[0], r[0]),
  Math.max(p[1], r[1]),
  Math.min(p[2], r[2]),
  Math.min(p[3], r[3]),
];
