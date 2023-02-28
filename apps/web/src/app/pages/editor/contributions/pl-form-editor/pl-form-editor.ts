import {
  Editor, OpenRequest,
  Paths
} from '@cisstech/nge-ide/core';

const extensions = [
  'plf',
];

export class PLFormEditor extends Editor {
  component = () =>
    import('./pl-form-editor.module').then((m) => m.PLFormEditorModule);
  canHandle(request: OpenRequest): boolean {
    const extension = Paths.extname(request.uri.path);
    return extensions.includes(extension);
  }
}
