import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Represents a component definition extracted from a TypeScript file
 */
export interface ExtractedComponentDefinition {
  name: string;
  selector: string;
  description: string;
  schema: Record<string, any>;
}

/**
 * Parses a TypeScript file to extract web component definitions
 */
export class ComponentDefinitionParser {
  /**
   * Extracts component definition from a TypeScript file
   * @param filePath Path to the TypeScript file containing the component definition
   * @returns The extracted component definition or null if none found
   */
  static extractComponentDefinition(filePath: string): ExtractedComponentDefinition | null {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      path.basename(filePath),
      fileContent,
      ts.ScriptTarget.Latest,
      true
    );

    let componentDefinition: ExtractedComponentDefinition | null = null;

    // Traverse the AST to find the defineWebComponent call
    function visit(node: ts.Node) {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'defineWebComponent' &&
        node.arguments.length > 0
      ) {
        // Found the defineWebComponent call, extract the object literal
        const arg = node.arguments[0];
        if (ts.isObjectLiteralExpression(arg)) {
          componentDefinition = extractDefinitionFromObjectLiteral(arg);
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return componentDefinition;
  }
}

/**
 * Extract component definition properties from an object literal expression
 * @param objLiteral The object literal from the AST
 * @returns Extracted component definition
 */
function extractDefinitionFromObjectLiteral(objLiteral: ts.ObjectLiteralExpression): ExtractedComponentDefinition {
  const result: Partial<ExtractedComponentDefinition> = {};

  objLiteral.properties.forEach(prop => {
    if (!ts.isPropertyAssignment(prop)) return;

    const propName = prop.name.getText();
    switch (propName) {
      case 'name':
        result.name =  extractObjectLiteralValue(prop.initializer);
        break;
      case 'selector':
        result.selector = extractObjectLiteralValue(prop.initializer);
        break;
      case 'description':
        result.description = extractObjectLiteralValue(prop.initializer);
        break;
      case 'schema':
        result.schema = extractObjectLiteralValue(prop.initializer);
        break;
    }
  });

  return result as ExtractedComponentDefinition;
}

/**
 * Extracts the value from a TypeScript node as a JavaScript object
 * @param node The TypeScript AST node
 * @returns The JavaScript object representation
 */
function extractObjectLiteralValue(node: ts.Node): any {
  if (ts.isObjectLiteralExpression(node)) {
    const obj: Record<string, any> = {};
    node.properties.forEach(prop => {
      if (ts.isPropertyAssignment(prop)) {
        const propName = prop.name.getText().replace(/['"`]/g, '');
        obj[propName] = extractObjectLiteralValue(prop.initializer);
      }
    });
    return obj;
  } else if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map(element => extractObjectLiteralValue(element));
  } else if (ts.isStringLiteral(node)) {
    return node.text.replace(/[\`]/g, '');
  } else if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  } else if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) {
    return node.kind === ts.SyntaxKind.TrueKeyword;
  } else {
    // For other types, return the text representation
    return node.getText().replace(/[\`]/g, '');
  }
}
