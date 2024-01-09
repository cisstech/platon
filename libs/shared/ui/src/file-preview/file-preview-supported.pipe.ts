import { Pipe, PipeTransform } from '@angular/core'
import { extractSupportedExtension } from './file-preview'

@Pipe({
  name: 'filePreviewSupported',
  standalone: true,
})
export class FilePreviewSupportedPipe implements PipeTransform {
  transform(url: string): boolean {
    return !!extractSupportedExtension(url)
  }
}
