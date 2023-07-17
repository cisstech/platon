/* Lexer */
%{

import { v4 as uuidv4 } from 'uuid'
import { Variables } from './pl.variables'

// VALUES

export interface PLValue {
  readonly value: string | number | boolean | PLValue[] | Record<string, PLValue>;
  readonly lineno: number;
  toObject(visitor: PLVisitor): any | Promise<any>;
}

export class PLArray implements PLValue {
  constructor(
    readonly value: PLValue[],
    readonly lineno: number
  ) {}
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
  constructor(
    readonly value: Record<string, PLValue>,
    readonly lineno: number
  ) {}
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
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}

  toObject() { return this.value.trim(); }
}

export class PLNumber implements PLValue {
  constructor(
    readonly value: number,
    readonly lineno: number
  ) {}
  toObject() { return this.value; }
}

export class PLBoolean implements PLValue {
  constructor(
    readonly value: boolean,
    readonly lineno: number
  ) {}
  toObject() { return this.value; }
}

export class PLComponent implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  toObject() { return { 'cid': uuidv4(), selector: this.value }; }
}

export class PLDict implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  async toObject(visitor: PLVisitor) {
    const source = await visitor.visitExtends(this, false);
    return source.variables
  }
}

export class PLFileURL implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  toObject(visitor: PLVisitor) { return visitor.visitCopyUrl(this); }
}

export class PLReference implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  toObject(visitor: PLVisitor) { return visitor.visitReference(this); }
}

export class PLFileContent implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  toObject(visitor: PLVisitor) { return visitor.visitCopyContent(this); }
}

// NODES

export interface PLNode {
  readonly type: string
  origin: string
  accept(visitor: PLVisitor): Promise<void>;
  toString(changes: Variables): string;
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

export interface PLSourceFile {
  resource: string;
  version: string;
  abspath: string;
  errors: {
    lineno: number,
    abspath: string
    description: string
  }[];
  warnings: {
    lineno: number,
    abspath: string
    description: string
  }[];
  variables: Record<string, unknown>;
  dependencies: PLDependency[];
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
<PATH_STATE>(\/?[a-zA-Z0-9_\+\.\\]+(\s+'as'\s+\/?[a-zA-Z0-9_\+\.])?)+   {
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
