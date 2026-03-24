type KeyCompare = (a: string, b: string) => number

export function hash(
  value: any,
  algorithm?: string,
  keyCompare?: KeyCompare
): string
