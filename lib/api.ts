import ky from 'ky'

import * as config from './config'

export async function fetchAssemblyAIRealtimeToken() {
  const url = `${config.apiBaseUrl}/api/token`

  const res = await ky(url).json<any>()

  return res.token as string
}

export async function getYoutubeMetadata(videoId: string) {
  const url = `${config.apiBaseUrl}/api/youtube?videoId=${videoId}`

  const res = await ky(url).json<any>()

  return res
}
