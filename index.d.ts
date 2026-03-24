type Replacer = ((key: string, value: any) => any) | string[]
type KeyCompare = (a: string, b: string) => number

export default function stringify(
  value: any,
  replacer?: Replacer,
  space?: string | number,
  keyCompare?: KeyCompare
): string | undefined

export function walk(
  value: any,
  write: (chunk: string) => void,
  keyCompare?: KeyCompare
): void
