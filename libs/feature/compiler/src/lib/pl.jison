/* Lexer */
%{

import { v4 as uuidv4 } from 'uuid'

// VALUES

interface PLValue {
  readonly value: string | number | boolean | PLValue[] | {key: string, value: PLValue}[];
  readonly lineno: number;
  toJSON(visitor: PLVisitor): any | Promise<any>;
}

export class PLArray implements PLValue {
  constructor(
    readonly value: PLValue[],
    readonly lineno: number,
  ) {}
  async toJSON(visitor: PLVisitor) {
    const result: any[] = [];
    // do not use promise.all to allow cache file operations (@copyurl, @copycontent...)
    for (const e of this.value) {
      result.push(await e.toJSON(visitor));
    }
    return result;
  }
}

export class PLObject implements PLValue {
  constructor(
    readonly value: {key: string, value: PLValue}[],
    readonly lineno: number,
  ) {}
  async toJSON(visitor: PLVisitor) {
    // do not use promise.all to allow cache file operations (@copyurl, @copycontent...)
    for (let i = 0; i < this.value.length; i++) {
      this.value[i].value = await this.value[i].value.toJSON(visitor);
    }
    return this.value.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as any);
  }
}

export class PLString implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number,
  ) {}

  toJSON() { return this.value.trim(); }
}

export class PLNumber implements PLValue {
  constructor(
    readonly value: number,
    readonly lineno: number,
  ) {}
  toJSON() { return this.value; }
}

export class PLBoolean implements PLValue {
  constructor(
    readonly value: boolean,
    readonly lineno: number,
  ) {}
  toJSON() { return this.value; }
}

export class PLComponent implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number,
  ) {}
  toJSON() { return { 'cid': uuidv4(), selector: this.value }; }
}

export class PLDict implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number,
  ) {}
  async toJSON(visitor: PLVisitor) {
    const source = await visitor.visitExtends(this, false);
    return source.variables
  }
}

export class PLFileURL implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number,
  ) {}
  toJSON(visitor: PLVisitor) { return visitor.visitCopyUrl(this); }
}

export class PLReference implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number,
  ) {}
  toJSON(visitor: PLVisitor) { return visitor.visitReference(this); }
}

export class PLFileContent implements PLValue {
  constructor(
    readonly value: string,
    readonly lineno: number,
  ) {}
  toJSON(visitor: PLVisitor) { return visitor.visitCopyContent(this); }
}

// NODES

export interface PLNode {
  accept(visitor: PLVisitor): Promise<void>;
}

export class ExtendsNode implements PLNode {
  constructor(
    readonly path: string,
    readonly lineno: number
  ) {}
  async accept(visitor: PLVisitor): Promise<void> {
    await visitor.visitExtends(this, true);
  }
}

export class CommentNode implements PLNode {
  constructor(
    readonly value: string,
    readonly lineno: number
  ) {}
  accept(visitor: PLVisitor): Promise<void> {
    return visitor.visitComment(this);
  }
}

export class IncludeNode implements PLNode {
  constructor(
    readonly path: string,
    readonly alias: string,
    readonly lineno: number,
  ) {}
  accept(visitor: PLVisitor): Promise<void> {
    return visitor.visitInclude(this);
  }
}

export class AssignmentNode implements PLNode {
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
  visit(nodes: PLNode[]): Promise<PLSourceFile>;
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
%s MULTI

%%

<INITIAL>\s+                                    /* ignore whitespace */
<INITIAL>\#.*                                   return 'COMMENT'
<INITIAL>\/\/.*                                 return 'COMMENT'
<INITIAL>\/\*([^*]|\*[^\/])*\*\/                return 'COMMENT'

<INITIAL>'=='                                   { this.begin('MULTI'); return 'EQUALS'; }
<INITIAL>'='                                    return 'EQUALS'
<INITIAL>'@copycontent'                         return 'COPYCONTENT'
<INITIAL>'@copyurl'                             return 'COPYURL'
<INITIAL>'@include'                             return 'INCLUDE'
<INITIAL>'@extends'                             return 'EXTENDS'
<INITIAL>'as'                                   return 'AS'
<INITIAL>\/[^\s\n\,]+                           return 'PATH' // COMMA AT THE END ALLOW TO INCLUDES PATH INSIDE ARRAY
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

<MULTI>[^\n]*\n          {
                          if (yytext.trim() === '==') {
                            this.popState();
                            return 'EQUALS';
                          }
                          return 'ANY'
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
      { $$ = new PLBoolean(Boolean($1.toLowerCase()), yylineno + 1); }
    | STRING
      { $$ = new PLString($1.slice(1, -1), yylineno + 1); }
    | EXTENDS PATH
      { $$ = new PLDict($2, yylineno + 1); }
    | COPYURL PATH
      { $$ = new PLFileURL($2, yylineno + 1); }
    | COPYCONTENT PATH
      { $$ = new PLFileContent($2, yylineno + 1); }
    | COLON SELECTOR
      { $$ = new PLComponent($2, yylineno + 1); }
    | LBRACKET RBRACKET
      { $$ = new PLArray([], yylineno + 1); }
    | LBRACKET elements RBRACKET
      { $$ = new PLArray($2, yylineno + 1); }
    | LBRACE RBRACE
      { $$ = new PLObject([], yylineno + 1); }
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
        { $$ = [$1]; }
    | pairs COMMA pair
        { $$ = $1.concat($3); }
    ;

pair
    : IDENTIFIER COLON value
        { $$ = { key: $1, value: $3 }; }
    ;

include_statement
    : INCLUDE PATH
      { $$ = new IncludeNode($2, '', yylineno + 1); }
    | INCLUDE PATH AS PATH
      { $$ = new IncludeNode($2, $4, yylineno + 1); }
    ;

extends_statement
    : EXTENDS PATH
      { $$ = new ExtendsNode($2, yylineno + 1); }
    ;
%%
