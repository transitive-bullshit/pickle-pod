import defaultKy from 'ky'

export class DexaClient {
  readonly api: typeof defaultKy
  readonly apiBaseUrl: string

  constructor({
    // apiKey = process.env.DEXA_API_KEY,
    apiBaseUrl = process.env.DEXA_API_BASE_URL,
    ky = defaultKy
  }: {
    // apiKey?: string
    apiBaseUrl?: string
    ky?: typeof defaultKy
  } = {}) {
    if (!apiBaseUrl) {
      throw new Error(
        `Error Dexa missing required "apiBaseUrl" or "DEXA_API_BASE_URL"`
      )
    }

    this.apiBaseUrl = apiBaseUrl
    this.api = ky.extend({
      prefixUrl: apiBaseUrl
    })
  }

  async generateDexaAnswerFromLex(queryOrQuestion: string) {
    const response = await fetch(
      `${this.apiBaseUrl}/api/lex?${encodeURIComponent(queryOrQuestion)}`,
      {
        // searchParams: {
        //   query: queryOrQuestion
        // },
        headers: {
          Accept: 'text/event-stream'
        }
        // onDownloadProgress: () => {} // trick ky to return ReadableStream
      }
    )

    return response.body
    // console.log('fooo', response)
    // const stream = response.body as ReadableStream
    // return stream.pipeThrough(
    //   new StreamCompletionChunker((response: string) => {
    //     return response
    //   })
    // )
  }
}

/** A function that converts from raw Completion response from OpenAI
 * into a nicer object which includes the first choice in response from OpenAI.
 */
type ResponseFactory<Raw, Nice> = (response: Raw) => Nice

/**
 * A parser for the streaming responses from the OpenAI API.
 *
 * Conveniently shaped like an argument for WritableStream constructor.
 */
class OpenAIStreamParser<Raw, Nice> {
  private responseFactory: ResponseFactory<Raw, Nice>
  onchunk?: (chunk: Nice) => void
  onend?: () => void

  constructor(responseFactory: ResponseFactory<Raw, Nice>) {
    this.responseFactory = responseFactory
  }

  /**
   * Takes the ReadableStream chunks, produced by `fetch` and turns them into
   * `CompletionResponse` objects.
   * @param chunk The chunk of data from the stream.
   */
  write(chunk: Uint8Array): void {
    const decoder = new TextDecoder()
    const s = decoder.decode(chunk)
    s.split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const pos = line.indexOf(':')
        const name = line.substring(0, pos)
        if (name !== 'data') return
        const content = line.substring(pos + 1).trim()
        if (content.length == 0) return
        if (content === '[DONE]') {
          this.onend?.()
          return
        }
        try {
          const parsed = JSON.parse(content)
          this.onchunk?.(this.responseFactory(parsed))
        } catch (e) {
          console.error('Failed parsing streamed JSON chunk', e)
        }
      })
  }
}

/**
 * A transform stream that takes the streaming responses from the OpenAI API
 * and turns them into useful response objects.
 */
class StreamCompletionChunker<Raw, Nice>
  implements TransformStream<Uint8Array, Nice>
{
  writable: WritableStream<Uint8Array>
  readable: ReadableStream<Nice>

  constructor(responseFactory: ResponseFactory<Raw, Nice>) {
    const parser = new OpenAIStreamParser(responseFactory)
    this.writable = new WritableStream(parser)
    this.readable = new ReadableStream({
      start(controller) {
        parser.onchunk = (chunk: Nice) => controller.enqueue(chunk)
        parser.onend = () => controller.close()
      }
    })
  }
}
