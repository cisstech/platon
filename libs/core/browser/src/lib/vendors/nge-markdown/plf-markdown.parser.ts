import {
  Injectable, Provider
} from '@angular/core';
import { NgeMarkdownContribution, NgeMarkdownTransformer, NGE_MARKDOWN_CONTRIBUTION } from '@cisstech/nge/markdown';
import EdjsParser from 'editorjs-parser'

@Injectable()
export class PlfMarkdownParser implements NgeMarkdownContribution {
  contribute(transformer: NgeMarkdownTransformer) {
    const parser = new EdjsParser();


    transformer.addHtmlTransformer((el) => {
      const paragraphs = el.querySelectorAll('p');

      paragraphs.forEach((node) => {
        const content = node.textContent || '';
        const editorJsOutputRegex = /^\s*\{[\s\S]*"blocks"\s*:\s*\[[\s\S]*\][\s\S]*\}\s*$/;
        const isEditorJsOutput = editorJsOutputRegex.test(content);

        if (isEditorJsOutput) {
          try {
            const editorjsData = JSON.parse(content);
            const htmlOutput = parser.parse(editorjsData);
            node.innerHTML = htmlOutput;
          } catch (error) {
            console.warn('Error parsing Editor.js output:', error);
          }
        }
      });

      return el;
    })
  }
}

export const PlfMarkdownParserContribution: Provider = {
  provide: NGE_MARKDOWN_CONTRIBUTION,
  multi: true,
  useClass: PlfMarkdownParser,
};
