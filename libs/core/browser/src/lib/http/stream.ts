import {
  HttpErrorResponse,
  HttpEventType,
  HttpHeaderResponse,
  HttpDownloadProgressEvent,
  HttpResponse,
  HttpClient,
} from '@angular/common/http'
import { Observable } from 'rxjs'

/**
 * Generic method to handle streaming requests
 * @param http The HTTP client
 * @param url The URL to post to
 * @param body The request body
 * @param parseChunk A function to parse each chunk of data
 * @returns An observable that emits parsed chunks
 */
export const streamRequest = <T, B = unknown>(
  http: HttpClient,
  url: string,
  body: B,
  parseChunk: (text: string) => T
): Observable<T> => {
  return new Observable<T>((observer) => {
    const decodeChunk = (chunk: string) => {
      if (chunk.includes('error: {')) {
        const error = JSON.parse(chunk.replace('error: ', ''))
        observer.error(new HttpErrorResponse({ status: error.status, statusText: error.message }))
        return ''
      }
      return chunk.replace(/data: /g, '')
    }
    let lastChunk = ''

    const subscription = http
      .post(url, body, { responseType: 'text', observe: 'events', reportProgress: true })
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.ResponseHeader) {
            const header = event as HttpHeaderResponse
            if (header.status >= 400) {
              observer.error(new HttpErrorResponse({ status: header.status, statusText: header.statusText }))
            }
          } else if (event.type === HttpEventType.DownloadProgress) {
            const progress = event as HttpDownloadProgressEvent
            const partialText = progress.partialText?.trim() || ''

            // Extract only new content since the last chunk
            const chunk = partialText.slice(lastChunk.length)
            lastChunk = partialText

            if (chunk) {
              try {
                const decodedChunk = decodeChunk(chunk)
                if (decodedChunk) {
                  observer.next(parseChunk(decodedChunk))
                }
              } catch (error) {
                console.warn('Failed to parse chunk:', chunk, error)
                // Continue processing other chunks
              }
            }
          } else if (event.type === HttpEventType.Response) {
            const response = event as HttpResponse<string>
            if (response.body) {
              const lastDataIndex = response.body.lastIndexOf('data: ')
              if (lastDataIndex !== -1) {
                const lastData = response.body.slice(lastDataIndex)
                try {
                  const decodedChunk = decodeChunk(lastData)
                  if (decodedChunk) {
                    observer.next(parseChunk(decodedChunk))
                  }
                } catch {
                  // Ignore parsing errors for the last chunk
                }
              }
            }
            observer.complete()
          }
        },
        error: (error) => observer.error(error),
        complete: () => observer.complete(),
      })

    // Return cleanup function
    return () => {
      subscription.unsubscribe()
    }
  })
}
