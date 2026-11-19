declare module 'editorjs-parser' {
  export default class EdjsParser {
    constructor(config?: any, customParsers?: any)
    parsers: Record<string, (data: any, config: any) => string>
    parse(data: any): string
  }
}
