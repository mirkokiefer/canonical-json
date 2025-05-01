export function stringify(
  value: any,
  replacer?: (key: string, value: any) => any,
  space?: string | number,
  keyCompare?: (a: string, b: string) => number
): string

export function stringifyCopy(
  value: any,
  keyCompare?: (a: string, b: string) => number
): string

export default stringify