export function encode(string: string): string {
  return encodeURIComponent(string).replace(/[!'()]/g, encodeURI).replace(/\*/g, '%2A');
}
