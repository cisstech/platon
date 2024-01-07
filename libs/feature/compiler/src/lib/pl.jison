/* Lexer */
%{

import { v4 as uuidv4 } from 'uuid'
import { Variables } from './pl.variables'

// VALUES

export type PLValueType = 'PLArray'
  | 'PLObject'
  | 'PLString'
  | 'PLNumber'
  | 'PLBoolean'
  | 'PLComponent'
  | 'PLDict'
  | 'PLFileURL'
  | 'PLReference'
  | 'PLFileContent'

export interface PLValue {
  readonly type: PLValueType
  readonly value: string | number | boolean | PLValue[] | Record<string, PLValue>;
  readonly lineno: number;
  toRaw(): any;
  toObject(visitor: PLVisitor): any | Promise<any>;
}

export class PLArray implements PLValue {
  readonly type = 'PLArray'
  constructor(
    readonly value: PLValue[],
    readonly lineno: number
  ) {}

  toRaw() {
    return this.value.map(value => value.toRaw())
  }

  async toObject(visitor: PLVisitor) {
    const result: any[] = [];
    // do not use promise.all to allow cache file operations (@copyurl, @copycontent...)
    for (const e of this.value) {
      result.push(await e.toObject(visitor));
    }
    return result;
  }
}

export class PLObject implements PLValue {
  readonly type = 'PLArray'
  constructor(
    readonly value: Record<string, PLValue>,
    readonly lineno: number
  ) {}

  toRaw() {
    return Object.keys(this.value)
      .reduce((acc, curr) => {
        acc[curr] = this.value[curr].toRaw()
        return acc
      }, {} as any)
  }

  async toObject(visitor: PLVisitor) {
    // do not use promise.all to allow cache file operations (@copyurl, @copycontent...)
    let result: any = {};
    for (let key in this.value) {
      result[key] = await this.value[key].toObject(visitor);
    }
    return result;
  }
}

export class PLString implements PLValue {
  readonly type = 'PLArray'
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  toRaw() {
    return this.value
  }
  toObject() { return this.value.trim(); }
}

export class PLNumber implements PLValue {
  readonly type = 'PLNumber'
  constructor(
    readonly value: number,
    readonly lineno: number
  ) {}
  toRaw() {
    return this.value
  }
  toObject() { return this.value; }
}

export class PLBoolean implements PLValue {
  readonly type = 'PLBoolean'
  constructor(
    readonly value: boolean,
    readonly lineno: number
  ) {}
  toRaw() {
    return this.value
  }
  toObject() { return this.value; }
}

export class PLComponent implements PLValue {
  readonly type = 'PLComponent'
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  toRaw() {
    return { cid: uuidv4(), selector: this.value }
  }
  toObject() { return { cid: uuidv4(), selector: this.value }; }
}

export class PLDict implements PLValue {
  readonly type = 'PLDict'
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  toRaw() {
    return `@extends ${this.value}`
  }
  async toObject(visitor: PLVisitor) {
    const source = await visitor.visitExtends(this, false);
    return source.variables
  }
}

export class PLFileURL implements PLValue {
  readonly type = 'PLFileURL'
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  toRaw() {
    return `@copyurl ${this.value}`
  }
  toObject(visitor: PLVisitor) { return visitor.visitCopyUrl(this); }
}

export class PLReference implements PLValue {
  readonly type = 'PLReference'
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  toRaw() {
    return this.value
  }
  toObject(visitor: PLVisitor) { return visitor.visitReference(this); }
}

export class PLFileContent implements PLValue {
  readonly type = 'PLFileContent'
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  toRaw() {
    return `@copycontent ${this.value}`
  }
  toObject(visitor: PLVisitor) { return visitor.visitCopyContent(this); }
}


// NODES

export type PLNodeType = 'ExtendsNode'
  | 'CommentNode'
  | 'IncludeNode'
  | 'AssignmentNode'

export interface PLNode {
  readonly type: PLNodeType
  origin: string
  accept(visitor: PLVisitor): Promise<void>;
}

export class ExtendsNode implements PLNode {
  readonly type = 'ExtendsNode'
  origin = ''

  constructor(
    readonly path: string,
    readonly lineno: number
  ) {}

  async accept(visitor: PLVisitor): Promise<void> {
    await visitor.visitExtends(this, true);
  }
}

export class CommentNode implements PLNode {
  readonly type = 'CommentNode'
  origin = ''

  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}

  accept(visitor: PLVisitor): Promise<void> {
    return visitor.visitComment(this);
  }
}

export class IncludeNode implements PLNode {
  readonly type = 'IncludeNode'
  origin = ''
  constructor(
    readonly path: string,
    readonly lineno: number
  ) {
  }
  accept(visitor: PLVisitor): Promise<void> {
    return visitor.visitInclude(this);
  }
}

export class AssignmentNode implements PLNode {
  readonly type = 'AssignmentNode'
  origin = ''

 constructor(
    readonly key: string,
    readonly value: PLValue,
    readonly lineno: number
  ) {}

  accept(visitor: PLVisitor): Promise<void> {
    return visitor.visitAssignment(this);
  }
}


// AST

export type PLAst = PLNode[]

export interface PLDependency {
  alias?: string;
  lineno: number;
  content: string;
  abspath: string;
}

export interface PLSourceFile<TVariables = Record<string, unknown>> {
  /** Identifier of the compiler resource. */
  resource: string

  /** Version of the compiled resource. */
  version: string

  /**
   * Absolute path to the source file.
   */
  abspath: string

  /**
   * All variables defined in the source file including extended variables.
   */
  variables: TVariables

  /** List of file added using the `@include` instruction. */
  dependencies: PLDependency[]
  ast: {
    /**
     * AST nodes of the main source file.
     */
    nodes: PLAst
    /**
     * Variables explicitly defined in the main source file.
     */
    variables: Record<string, unknown>
  }

  /**
   * Errors detected while compiling the source file.
   */
  errors: {
    lineno: number
    abspath: string
    description: string
  }[]

  /**
   * Warnings detected while compiling the source file.
   */
  warnings: {
    lineno: number
    abspath: string
    description: string
  }[]
}

// VISITOR

export interface PLVisitor {
  visit(ast: PLAst): Promise<PLSourceFile>;
  visitExtends(node: ExtendsNode | PLDict, merge: boolean): Promise<PLSourceFile>;
  visitInclude(node: IncludeNode): Promise<void>;
  visitComment(node: CommentNode): Promise<void>;
  visitAssignment(node: AssignmentNode): Promise<void>;
  visitCopyUrl(node: PLFileURL): Promise<string>;
  visitReference(node: PLReference): Promise<any>;
  visitCopyContent(node: PLFileContent): Promise<string>;
}

%}

%lex
%s PATH_STATE
%s MULTI_STATE

%%

<INITIAL>\s+                                    /* ignore whitespace */
<INITIAL>\#.*                                   return 'COMMENT'
<INITIAL>\/\/.*                                 return 'COMMENT'
<INITIAL>\/\*([^*]|\*[^\/])*\*\/                return 'COMMENT'

<INITIAL>'=='                                   { this.begin('MULTI_STATE'); return 'EQUALS'; }
<INITIAL>'='                                    return 'EQUALS'
<INITIAL>'@copycontent'                         { this.begin('PATH_STATE'); return 'COPYCONTENT'}
<INITIAL>'@copyurl'                             { this.begin('PATH_STATE'); return 'COPYURL' }
<INITIAL>'@include'                             { this.begin('PATH_STATE'); return 'INCLUDE' }
<INITIAL>'@extends'                             { this.begin('PATH_STATE'); return 'EXTENDS' }
<INITIAL>[+-]?\d+((_|\.)+\d+)*                  return 'NUMBER'
<INITIAL>[,]                                    return 'COMMA'
<INITIAL>[:]                                    return 'COLON'
<INITIAL>[\{]                                   return 'LBRACE'
<INITIAL>[\}]                                   return 'RBRACE'
<INITIAL>[\[]                                   return 'LBRACKET'
<INITIAL>[\]]                                   return 'RBRACKET'
<INITIAL>true|false|True|False                  return 'BOOLEAN'
<INITIAL>'wc-'[a-zA-Z0-9_-]+                    return 'SELECTOR'
<INITIAL>[a-zA-Z_](\.?[a-zA-Z0-9_])*            return 'IDENTIFIER'
<INITIAL>\"([^\\\"]|\\.)*\"                     return 'STRING'

<<EOF>>                                         return 'EOF'

<MULTI_STATE>[^\n]*\n          {
                          if (yytext.trim() === '==') {
                            this.popState();
                            return 'EQUALS';
                          }
                          return 'ANY'
                         }


<PATH_STATE>\s+         /* ignore whitespace */
<PATH_STATE>(\/?[a-zA-Z0-9_\+\.\\:]+(\s+'as'\s+\/?[a-zA-Z0-9_\+\.])?)+   {
                            this.popState();
                            return 'PATH';
                        }
/lex

/* Parser */

%start program

%%

program
    : statements EOF
        { return $1 }
    ;

statements
    : statement
      { $$ = [$1]; }
    | comment
      { $$ = [$1] }
    | statements comment
      { $$ = $1.concat($2) }
    | statements statement
      { $$ = $1.concat($2); }
    ;

comment
    : COMMENT
      { $$ = new CommentNode($1, yylineno + 1); }
    ;

statement
    : assignment_statement
        { $$ = $1; }
    | include_statement
        { $$ = $1; }
    | extends_statement
        { $$ = $1; }
    ;

assignment_statement
    : IDENTIFIER EQUALS COMMENT EQUALS
        { $$ = new AssignmentNode($1, new PLString('', yylineno + 1), yylineno + 1); }
    | IDENTIFIER EQUALS EQUALS
        { $$ = new AssignmentNode($1, new PLString('', yylineno + 1), yylineno + 1); }
    | IDENTIFIER EQUALS value_multi EQUALS
        { $$ = new AssignmentNode($1, new PLString($3, yylineno + 1), yylineno + 1); }
    | IDENTIFIER EQUALS value
        { $$ = new AssignmentNode($1, $3, yylineno + 1); }
    ;

value
    : COMMENT value
      { $$ = $2; }
    | NUMBER
      { $$ = new PLNumber(Number($1.replace(/_/g, '')), yylineno + 1); }
    | IDENTIFIER
      { $$ = new PLReference($1, yylineno + 1); }
    | BOOLEAN
      { $$ = new PLBoolean($1.toLowerCase() === 'true', yylineno + 1); }
    | STRING
      { $$ = new PLString($1.slice(1, -1), yylineno + 1); }
    | EXTENDS PATH
      { $$ = new PLDict($2, yylineno + 1); }
    | COPYURL PATH
      { $$ = new PLFileURL($2.trim(), yylineno + 1); }
    | COPYCONTENT PATH
      { $$ = new PLFileContent($2, yylineno + 1); }
    | COLON SELECTOR
      { $$ = new PLComponent($2, yylineno + 1); }
    | LBRACKET RBRACKET
      { $$ = new PLArray([], yylineno + 1); }
    | LBRACKET elements RBRACKET
      { $$ = new PLArray($2, yylineno + 1); }
    | LBRACE RBRACE
      { $$ = new PLObject({}, yylineno + 1); }
    | LBRACE pairs RBRACE
      { $$ = new PLObject($2, yylineno + 1); }
    ;

value_multi
    : value_multi ANY
      {
        $$ = $1 + $2;
      }
    | ANY {
        if ($1.trim().startsWith('#!lang=')) {
          $$ = '';
        } else {
          $$ = $1;
        }
    }
    ;

elements
    : value
        { $$ = [$1]; }
    | elements COMMA value
        { $$ = $1.concat($3); }
    ;

pairs
    : pair
        { $$ = $1; }
    | pairs COMMA pair
        {
          const keys = Object.keys($3);
          $1[keys[0]] = $3[keys[0]];
          $$ = $1;
        }
    ;

pair
    : IDENTIFIER COLON value
        { $$ = { [`${$1}`]: $3 }; }
    ;

include_statement
    : INCLUDE PATH
      { $$ = new IncludeNode($2.trim(), yylineno + 1); }
    ;

extends_statement
    : EXTENDS PATH
      { $$ = new ExtendsNode($2.trim(), yylineno + 1); }
    ;
%%
