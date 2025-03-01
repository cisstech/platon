import * as ts from 'typescript';

export interface Change {
  description: string;
  order: number;
  path: string;
}

/**
 * An operation that inserts new text at the given position.
 */
export class InsertChange implements Change {
  order: number;
  description: string;

  constructor(public path: string, public pos: number, public toAdd: string) {
    this.description = `Inserted ${toAdd} into ${path} at ${pos}`;
    this.order = pos;
  }
}

/**
 * Find all nodes from the AST in the subtree of node of SyntaxKind kind.
 * @param node The root node to check.
 * @param kind The syntax kind to check for.
 * @param max The maximum number of nodes to return.
 * @param recursive Whether to check sub-children for the syntax kind.
 * @return all nodes of syntax kind, or [] if none is found
 */
export function findNodes(
  node: ts.Node,
  kind: ts.SyntaxKind,
  max = Infinity,
  recursive = true
): ts.Node[] {
  if (!node || max == 0) {
    return [];
  }

  const arr: ts.Node[] = [];
  if (node.kind === kind) {
    arr.push(node);
    max--;
  }

  if (max > 0 && recursive) {
    for (const child of node.getChildren()) {
      findNodes(child, kind, max - arr.length, recursive).forEach((node) => {
        if (max > arr.length) {
          arr.push(node);
        }
      });
    }
  }

  return arr;
}

/**
 * Insert an import statement at the beginning of a file.
 */
export function insertImport(
  source: ts.SourceFile,
  fileToEdit: string,
  symbolName: string,
  fileName: string,
  isDefault = false
): InsertChange {
  const rootNode = source;
  const allImports = findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);

  // Get the index of the last import statement
  if (allImports.length > 0) {
    const lastImport = allImports[allImports.length - 1];
    const text = isDefault
      ? `import ${symbolName} from '${fileName}';\n`
      : `import { ${symbolName} } from '${fileName}';\n`;

    return new InsertChange(fileToEdit, lastImport.end + 1, text);
  }

  // No imports found, insert at the beginning of the file
  return new InsertChange(fileToEdit, 0, isDefault
    ? `import ${symbolName} from '${fileName}';\n`
    : `import { ${symbolName} } from '${fileName}';\n`);
}
