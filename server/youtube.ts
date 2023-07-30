import { format, parseISO } from 'date-fns'
import defaultKy from 'ky'

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com'

interface YoutubeMetadataResponse {
  kind: string
  etag: string
  items: Item[]
  pageInfo: PageInfo
}

interface Item {
  kind: string
  etag: string
  id: string

  snippet: YoutubeSnippet
  contentDetails: ContentDetails
}

interface PageInfo {
  totalResults: number
  resultsPerPage: number
}

interface YoutubeSnippet {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: Thumbnails
  channelTitle: string
  tags: string[]
  categoryId: string
  liveBroadcastContent: string
  localized: Title
  defaultAudioLanguage: string
}

interface Title {
  title: string
  description: string
}

interface Thumbnails {
  default: Thumbnail
  medium: Thumbnail
  high: Thumbnail
  standard: Thumbnail
  maxres: Thumbnail
}

interface Thumbnail {
  url: string
  width: number
  height: number
}

interface ContentDetails {
  duration: string
  dimension: string
  definition: string
  caption: string
  licensedContent: boolean
  contentRating: ContentRating
  projection: string
}

interface ContentRating {}

const convertYouTubeDuration = function (duration = this) {
  const time_extractor = /([0-9]*H)?([0-9]*M)?([0-9]*S)?$/
  const extracted = time_extractor.exec(duration)!
  const hours = parseInt(extracted[1], 10) || 0
  const minutes = parseInt(extracted[2], 10) || 0
  const seconds = parseInt(extracted[3], 10) || 0
  const ms = hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000
  // This solution is limited to range of one day,
  // which is fine if you use it to format milliseconds up to 24 hours (i.e. ms < 86400000)
  const ret = new Date(ms).toISOString().slice(11, -1).split('.')[0]
  console.log(ret)
  return ret
}

export class YoutubeClient {
  readonly api: typeof defaultKy

  constructor({
    apiKey = process.env.GOOGLE_API_KEY,
    apiBaseUrl = YOUTUBE_API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: typeof defaultKy
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error Youtube missing required "apiKey"`)
    }

    this.api = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        authorization: apiKey
      }
    })
  }

  async getMetadata(videoId: string) {
    const returnJson = await this.api
      .get('youtube/v3/videos', {
        searchParams: {
          id: videoId,
          key: process.env.GOOGLE_API_KEY!,
          part: 'snippet,contentDetails'
        }
      })
      .json<YoutubeMetadataResponse>()

    console.log(returnJson)

    returnJson.items.map((item) => {
      item.contentDetails.duration = convertYouTubeDuration(
        item.contentDetails.duration
      )

      const date = parseISO(item.snippet.publishedAt)
      item.snippet.publishedAt = format(date, 'MMMM dd, yyyy')
    })

    return returnJson
  }
}
