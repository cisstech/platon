import { AssignmentNode, CommentNode, CopyContentNode, CopyUrlNode, IncludeNode, ExtendsNode, PLVisitor, PLSourceFile, PLNode } from "./pl.parser";

/**
 * File reference resolver for the PL compiler.
 * This interface is used to abstract the resolving the files so each plateform (browser, server) can use the PL compiler.
 */
export interface PLReferenceResolver {
  /**
   * Gets the download url of the file at `path` relative to the file `from`.
   * @param path Path to resolves.
   * @param from Path of the file from which the url should be resolved.
   */
  resolveUrl(path: string, from: string): Promise<string>;
  /**
   * Gets the content of the file at `path` relative to the file `from`.
   * @param path Path to resolves.
   * @param from Path of the file from which the url should be resolved.
   */
  resolveContent(path: string, from: string): Promise<string>;
}


/**
 * Compiles a PL AST to a PLSourceFile.
 */
export class PLCompiler implements PLVisitor {
  private readonly source: PLSourceFile = {
    errors: [],
    warnings: [],
    variables: {},
    dependencies: [],
  }

  constructor(
    private readonly path: string,
    private readonly resolver: PLReferenceResolver
  ) {}

  async visit(nodes: PLNode[]): Promise<PLSourceFile> {
    // should not use Promise.all() since references should be resolved in sync.
    for (const node of nodes) {
      await node.accept(this);
    }
    return this.source;
  }

  visitExtends(node: ExtendsNode): Promise<void> {
    console.log('visit', 'visitUse');
    return Promise.resolve();
  }

  visitInclude(node: IncludeNode): Promise<void> {
    console.log('visit', 'visitInclude');
    return Promise.resolve();
  }

  visitComment(node: CommentNode): Promise<void> {
    console.log('visit', 'visitComment');
    return Promise.resolve();
  }

  visitCopyUrl(node: CopyUrlNode): Promise<void> {
    console.log('visit', 'visitCopyUrl')
    return Promise.resolve();
  }

  visitCopyContent(node: CopyContentNode): Promise<void> {
    console.log('visit', 'visitCopyContent')
    return Promise.resolve();
  }

  visitAssignment(node: AssignmentNode): Promise<void> {
    console.log('visit', 'visitAssignment')
    return Promise.resolve();
  }

}
