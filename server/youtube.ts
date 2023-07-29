import defaultKy from 'ky'
import type { NextApiRequest, NextApiResponse } from 'next'

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3/videos?'

interface YoutubeMetadataResponse {
  kind: string
  etag: string
  items: Item[]
  pageInfo: PageInfo
  snippet: YoutubeSnippet
  contentDetails: ContentDetails
}

interface Item {
  kind: string
  etag: string
  id: string
}

interface PageInfo {
  totalResults: number
  resultsPerPage: number
}

interface YoutubeSnippet {
  publishedAt: Date
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
    return this.api
      .get(``, {
        searchParams: {
          id: videoId,
          key: process.env.GOOGLE_API_KEY,
          part: 'snippet,contentDetails'
        }
      })
      .json<YoutubeMetadataResponse>()
  }
}
