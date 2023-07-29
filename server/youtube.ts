import defaultKy from 'ky'
import type { NextApiRequest, NextApiResponse } from 'next'

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3/videos?'

export class YoutubeClient {
  readonly api: typeof defaultKy

  constructor({
    apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
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
          key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          part: 'snippet,contentDetails'
        }
      })
      .json()
  }
}
