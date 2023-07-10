export function encode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16)
  })
}

export function encodeRFC3986 (str: string) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
