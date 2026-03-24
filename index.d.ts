type Replacer = ((key: string, value: any) => any) | string[]

export default function stringify(
  value: any,
  replacer?: Replacer,
  space?: string | number,
  keyCompare?: (a: string, b: string) => number
): string | undefined
