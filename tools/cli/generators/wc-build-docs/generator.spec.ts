import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import generator from './generator';
import { WcBuildDocsGeneratorSchema } from './schema';
import * as path from 'path';
import * as fs from 'fs';

// Mock the ComponentDefinitionParser
jest.mock('./utils/component-definition-parser', () => {
  return {
    ComponentDefinitionParser: {
      extractComponentDefinition: jest.fn().mockImplementation(() => {
        return {
          name: 'TestComponent',
          selector: 'wc-test-component',
          description: 'Test component description',
          schema: { properties: {} }
        };
      })
    }
  };
});

// Create mock EJS template file for tests
const createMockTemplateFile = () => {
  const templateDir = path.join(__dirname, 'templates');
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }

  fs.writeFileSync(path.join(templateDir, 'component.mdx.template'), `---
title: <%= name %>
---

# <%= name %>
---
<%= selector %>

<%= description %>

<%= markdownContent %>

\`\`\`json
<%= JSON.stringify(schema, null, 2) %>
\`\`\`
`);
};

describe('wc-build-docs generator', () => {
  let tree: Tree;
  const options: WcBuildDocsGeneratorSchema = {
    sourceDir: 'libs/feature/webcomponent/src/lib',
    outputDir: 'dist/docs/webcomponent'
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    // Create the mock template file
    createMockTemplateFile();

    // Create mock directory structure and files
    const testComponents = [
      {
        path: 'libs/feature/webcomponent/src/lib/forms/input-box',
        markdownFile: 'input-box.md',
        tsFile: 'input-box.ts',
        mdContent: '# Input Box Component\n\nThis is the documentation for the input box component.',
        tsContent: `
import { defineWebComponent } from '../../web-component';
export const InputBoxComponentDefinition = defineWebComponent({
  name: 'InputBox',
  selector: 'wc-input-box',
  description: 'A component for input boxes',
  schema: {}
});
`
      },
      {
        path: 'libs/feature/webcomponent/src/lib/forms/code-editor',
        markdownFile: 'code-editor.md',
        tsFile: 'code-editor.ts',
        mdContent: '# Code Editor Component\n\nThis is the documentation for the code editor component.',
        tsContent: `
import { defineWebComponent } from '../../web-component';
export const CodeEditorComponentDefinition = defineWebComponent({
  name: 'CodeEditor',
  selector: 'wc-code-editor',
  description: 'A component for editing code',
  schema: {}
});
`
      },
      {
        path: 'libs/feature/webcomponent/src/lib/widgets/markdown',
        markdownFile: 'markdown.md',
        tsFile: 'markdown.ts',
        mdContent: '# Markdown Component\n\nThis is the documentation for the markdown component.',
        tsContent: `
import { defineWebComponent } from '../../web-component';
export const MarkdownComponentDefinition = defineWebComponent({
  name: 'Markdown',
  selector: 'wc-markdown',
  description: 'A component for rendering markdown',
  schema: {}
});
`
      }
    ];

    // Create the directory structure and files
    testComponents.forEach(component => {
      tree.write(`${component.path}/.gitkeep`, '');
      tree.write(`${component.path}/${component.markdownFile}`, component.mdContent);
      tree.write(`${component.path}/${component.tsFile}`, component.tsContent);
    });
  });

  it('should generate MDX documentation files using templates', async () => {
    await generator(tree, options);

    // Check if output files were created with .mdx extension
    expect(tree.exists('dist/docs/webcomponent/forms/input-box.mdx')).toBeTruthy();
    expect(tree.exists('dist/docs/webcomponent/forms/code-editor.mdx')).toBeTruthy();
    expect(tree.exists('dist/docs/webcomponent/widgets/markdown.mdx')).toBeTruthy();
    expect(tree.exists('dist/docs/webcomponent/index.mdx')).toBeTruthy();

    // Verify content structure for MDX
    const mdxContent = tree.read('dist/docs/webcomponent/forms/input-box.mdx', 'utf-8');
    expect(mdxContent).toContain('---\ntitle: TestComponent');
    expect(mdxContent).toContain('# TestComponent');
    expect(mdxContent).toContain('wc-test-component');
    expect(mdxContent).toContain('Test component description');

    // Verify index content references .mdx files
    const indexContent = tree.read('dist/docs/webcomponent/index.mdx', 'utf-8');
    expect(indexContent).toContain('# Webcomponent Documentation');
    expect(indexContent).toContain('./forms/input-box.mdx');
  });
});
