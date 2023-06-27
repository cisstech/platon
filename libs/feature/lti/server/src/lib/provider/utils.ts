export function encode(string: string): string {
  return encodeURIComponent(string).replace(/[!'()]/g, encodeURI).replace(/\*/g, '%2A');
}

export function encodeRFC3986 (str: string) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
