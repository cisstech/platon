import { importProvidersFrom } from '@angular/core'
import { Routes } from '@angular/router'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { ResourceFileSystemProvider } from './contributions/file-system'
import { EditorPage } from './editor.page'
import { EditorPresenter } from './editor.presenter'

export default [
  {
    path: ':id',
    component: EditorPage,
    title: 'PLaTon - Éditeur',
    providers: [EditorPresenter, ResourceFileSystemProvider, importProvidersFrom(NzModalModule)],
  },
] as Routes
