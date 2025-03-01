import {
  Tree,
  formatFiles,
  generateFiles
} from '@nx/devkit';
import * as fs from 'fs';
import * as path from 'path';
import { WcBuildDocsGeneratorSchema } from './schema';
import { ComponentDefinitionParser } from './utils/component-definition-parser';
import { MdxTemplateGenerator } from './utils/mdx-template-generator';
import { getTemplateFiles } from './templates/files';

interface WebComponentInfo {
  name: string;
  type: 'forms' | 'widgets';
  markdownPath: string;
  definitionPath: string;
}

function findWebComponents(sourceDir: string): WebComponentInfo[] {
  const results: WebComponentInfo[] = [];
  const componentTypes = ['forms', 'widgets'];

  // Process each component type directory (forms, widgets)
  componentTypes.forEach((type) => {
    const typeDirPath = path.join(sourceDir, type);
    if (!fs.existsSync(typeDirPath)) {
      console.warn(`Directory ${typeDirPath} does not exist. Skipping...`);
      return;
    }

    // Get all component folders within the type directory
    const componentDirs = fs.readdirSync(typeDirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Check each component folder for markdown files and component definitions
    componentDirs.forEach(componentDir => {
      const componentPath = path.join(typeDirPath, componentDir);
      const markdownPath = path.join(componentPath, `${componentDir}.md`);
      const definitionPath = path.join(componentPath, `${componentDir}.ts`);

      if (fs.existsSync(markdownPath) && fs.existsSync(definitionPath)) {
        results.push({
          name: componentDir,
          type: type as 'forms' | 'widgets',
          markdownPath,
          definitionPath
        });
      } else if (!fs.existsSync(definitionPath)) {
        console.warn(`Definition file not found for component ${componentDir}`);
      }
    });
  });

  return results;
}

export default async function(tree: Tree, options: WcBuildDocsGeneratorSchema) {
  const sourceDir = options.sourceDir;
  const outputDir = options.outputDir;

  // Ensure output directory exists
  if (!tree.exists(outputDir)) {
    tree.write(`${outputDir}/.gitkeep`, '');
  }

  // Find all webcomponent documentation files
  const webComponents = findWebComponents(sourceDir);
  console.log(`Found ${webComponents.length} webcomponent documentation files.`);

  // Generate output files using templates
  webComponents.forEach(component => {
    try {
      // Parse the component definition
      const componentDefinition = ComponentDefinitionParser.extractComponentDefinition(component.definitionPath);

      if (!componentDefinition) {
        console.warn(`Failed to extract component definition for ${component.name}`);
        return;
      }

      // Read the markdown content
      let documentation = '';
      if (fs.existsSync(component.markdownPath)) {
        documentation = fs.readFileSync(component.markdownPath, 'utf-8');
      }

      // Generate the MDX file using EJS template
      const typeOutputDir = path.join(outputDir, component.type);
      const templatesDir = path.join(__dirname, 'templates/component');

      // Ensure the type directory exists
      if (!tree.exists(typeOutputDir)) {
        tree.write(`${typeOutputDir}/.gitkeep`, '');
      }

      // Generate files using the NX generateFiles function
      generateFiles(
        tree,
        templatesDir,
        typeOutputDir,
        {
          ...componentDefinition,
          documentation,
        }
      );

      console.log(`Generated MDX documentation for ${component.name} at ${typeOutputDir}/${component.name}.mdx`);
    } catch (error) {
      console.error(`Error generating MDX for ${component.name}:`, error);
    }
  });


  generateFiles(
    tree,
    path.join(__dirname, 'templates/docs'),
    path.join(outputDir),
    {}
  );

  await formatFiles(tree);
}

function generateIndexContent(components: WebComponentInfo[]): string {
  let content = `---
title: Componants
---

# Componants\n\n`;

  // Group components by type
  const formComponents = components.filter(c => c.type === 'forms');
  const widgetComponents = components.filter(c => c.type === 'widgets');

  content += '## Forms\n\n';
  formComponents.forEach(component => {
    content += `- [${component.name}](./components/forms/wc-${component.name}.mdx)\n`;
  });

  content += '\n## Widgets\n\n';
  widgetComponents.forEach(component => {
    content += `- [${component.name}](./components/widgets/wc-${component.name}.mdx)\n`;
  });

  return content;
}
