declare module 'turndown' {
  export interface TurndownOptions {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: '-' | '+' | '*';
    codeBlockStyle?: 'indented' | 'fenced';
    fence?: '```' | '~~~';
    emDelimiter?: '_' | '*';
    strongDelimiter?: '__' | '**';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
  }

  export type Filter = (node: Node) => boolean;

  export interface Replacement {
    filter: string | string[] | Filter;
    replacement: (content: string, node: Node | null, options?: any) => string;
  }

  export interface TurndownServiceOptions extends TurndownOptions {
    rules?: Replacement[];
    keep?: Filter[];
    remove?: Filter[];
  }

  export class TurndownService {
    constructor(options?: TurndownServiceOptions);
    turndown(html: string): string;
    use(plugin: Array<(service: TurndownService) => void> | ((service: TurndownService) => void)): TurndownService;
    addRule(key: string, rule: Replacement): TurndownService;
    keep(filter: Filter): TurndownService;
    remove(filter: Filter): TurndownService;
    escape(text: string): string;
  }

  // The `turndown` package exports both a factory function and the class.
  // We type the default as the class so `new TurndownService()` works.
  export default TurndownService;
}