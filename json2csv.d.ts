declare module 'json2csv' {
  export class Parser<T = unknown> {
    constructor(opts?: {
      fields?: string[];
      delimiter?: string;
      eol?: string;
      header?: boolean;
      includeEmptyRows?: boolean;
      withBOM?: boolean;
    });
    parse(data: T | T[]): string;
  }
}
