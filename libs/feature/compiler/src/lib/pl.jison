/* Lexer */
%{

// VALUES

interface PLValue {
  readonly type: 'number' | 'boolean' | 'string' | 'array' | 'object' | 'component' | 'identifier';
  readonly value: string | number | boolean | PLValue[] | Record<string, PLValue>;
  readonly lineno: number;
}

export class PLString implements PLValue {
  readonly type = 'string';
  constructor(
    readonly value: string,
    readonly lineno: number,
  ) {}
}

export class PLNumber implements PLValue {
  readonly type = 'number';
  constructor(
    readonly value: number,
    readonly lineno: number,
  ) {}
}

export class PLBoolean implements PLValue {
  readonly type = 'boolean';
  constructor(
    readonly value: boolean,
    readonly lineno: number,
  ) {}
}

export class PLComponent implements PLValue {
  readonly type = 'component';
  constructor(
    readonly value: string,
    readonly lineno: number,
  ) {}
}

export class PLArray implements PLValue {
  readonly type = 'array';
  constructor(
    readonly value: PLValue[],
    readonly lineno: number,
  ) {}
}

export class PLObject implements PLValue {
  readonly type = 'array';
  constructor(
    readonly value: Record<string, PLValue>,
    readonly lineno: number,
  ) {}
}

export class PLIdentifier implements PLValue {
  readonly type = 'identifier';
  constructor(
    readonly value: string,
    readonly lineno: number,
  ) {}
}

// NODES

export interface PLNode {
  accept(visitor: PLVisitor): Promise<void>;
}

export class ExtendsNode implements PLNode {
  constructor(
    readonly path: string,
    readonly alias: string,
    readonly lineno: number
  ) {}
  accept(visitor: PLVisitor): Promise<void> {
    return visitor.visitExtends(this);
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

export class CopyUrlNode implements PLNode {
  constructor(
    readonly path: string,
    readonly into: string,
    readonly lineno: number
  ) {}
  accept(visitor: PLVisitor): Promise<void> {
    return visitor.visitCopyUrl(this);
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

export class CopyContentNode implements PLNode {
  constructor(
    readonly path: string,
    readonly into: string,
    readonly lineno: number
  ) {}
  accept(visitor: PLVisitor): Promise<void> {
    return visitor.visitCopyContent(this);
  }
}


// AST
export interface PLMessage {
  lineno: number;
  filepath: string;
  description: string;
}

export interface PLVariable<T = unknown> {
  value: T;
  doc?: string;
  lineno: number;
  filepath: string;
}

export interface PLDependency {
  path: string;
  type: 'use' | 'copyurl' | 'copycontent' | 'include';
  lineno: number;
  alias?: string;
}

export interface PLSourceFile {
  errors: PLMessage[];
  warnings: PLMessage[];
  variables: Record<string, PLVariable>;
  dependencies: PLDependency[];
}

// VISITOR

export interface PLVisitor {
  visit(nodes: PLNode[]): Promise<PLSourceFile>;
  visitExtends(node: ExtendsNode): Promise<void>;
  visitInclude(node: IncludeNode): Promise<void>;
  visitComment(node: CommentNode): Promise<void>;
  visitCopyUrl(node: CopyUrlNode): Promise<void>;
  visitAssignment(node: AssignmentNode): Promise<void>;
  visitCopyContent(node: CopyContentNode): Promise<void>;
}

%}

%lex
%s MULTI

%%

<INITIAL>\s+                                    /* ignore whitespace */
<INITIAL>\/\/.*                                 return 'COMMENT'
<INITIAL>\/\*([^*]|\*[^\/])*\*\/                return 'COMMENT'

<INITIAL>'=='                                   { this.begin('MULTI'); return 'EQUALS'; }
<INITIAL>'='                                    return 'EQUALS'
<INITIAL>'@copycontent'                         return 'COPYCONTENT'
<INITIAL>'@copyurl'                             return 'COPYURL'
<INITIAL>'@include'                             return 'INCLUDE'
<INITIAL>'@extends'                             return 'EXTENDS'
<INITIAL>'as'                                   return 'AS'
<INITIAL>'into'                                 return 'INTO'
<INITIAL>\/[^\s\n]+                             return 'PATH'
<INITIAL>[+-]?\d+                               return 'NUMBER'
<INITIAL>[,]                                    return 'COMMA'
<INITIAL>[:]                                    return 'COLON'
<INITIAL>[\{]                                   return 'LBRACE'
<INITIAL>[\}]                                   return 'RBRACE'
<INITIAL>[\[]                                   return 'LBRACKET'
<INITIAL>[\]]                                   return 'RBRACKET'
<INITIAL>true|false|True|False                  return 'BOOLEAN'
<INITIAL>[a-zA-Z_](\.?[a-zA-Z0-9_])*            return 'IDENTIFIER'
<INITIAL>\"([^\\\"]|\\.)*\"                     return 'STRING'

<<EOF>>                                         return 'EOF'

<MULTI>\s'=='            {  this.popState(); return 'EQUALS' }
<MULTI>\s+               {  return 'ANY' }
<MULTI>[^\s]*            {  return 'ANY' }

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
    | use_statement
        { $$ = $1; }
    | copyurl_statement
        { $$ = $1; }
    | copycontent_statement
        { $$ = $1; }
    ;

assignment_statement
    : IDENTIFIER EQUALS EQUALS
        { $$ = new AssignmentNode($1, new PLString('', yylineno + 1), yylineno + 1); }
    | IDENTIFIER EQUALS value_multi EQUALS
        { $$ = new AssignmentNode($1, $3, yylineno + 1); }
    | IDENTIFIER EQUALS value
        { $$ = new AssignmentNode($1, $3, yylineno + 1); }
    ;

value
    : NUMBER
      { $$ = new PLNumber(Number($1), yylineno + 1); }
    | IDENTIFIER
      { $$ = new PLIdentifier($1, yylineno + 1); }
    | BOOLEAN
      { $$ = new PLBoolean(Boolean($1.toLowerCase()), yylineno + 1); }
    | STRING
      { $$ = new PLString($1.slice(1, -1), yylineno + 1); }
    | COLON IDENTIFIER
      { $$ = new PLComponent($2, yylineno + 1) }
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
      { $$ = $1 + $2 }
    | ANY
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

use_statement
    : EXTENDS PATH
      { $$ = new ExtendsNode($2, '', yylineno + 1); }
    | EXTENDS PATH INTO IDENTIFIER
      { $$ = new ExtendsNode($2, $4, yylineno + 1); }
    ;

copyurl_statement
    : COPYURL PATH INTO IDENTIFIER
      { $$ = new CopyUrlNode($2, $4, yylineno + 1); }
    ;

copycontent_statement
    : COPYCONTENT PATH INTO IDENTIFIER
      { $$ = new CopyContentNode($2, $4, yylineno + 1); }
    ;

%%
