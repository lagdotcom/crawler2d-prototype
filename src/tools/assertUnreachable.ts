export function assertUnreachable(x: never, message: string): never {
  throw new Error(message);
}
