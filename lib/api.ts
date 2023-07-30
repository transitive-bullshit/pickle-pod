import ky from 'ky'

import * as config from './config'

export async function fetchAssemblyAIRealtimeToken() {
  const url = `${config.apiBaseUrl}/api/token`

  const res = await ky(url).json<any>()

  return res.token as string
}

export async function getYoutubeMetadata(videoId: string) {
  const url = `${config.apiBaseUrl}/api/youtube`

  return ky(url, {
    searchParams: {
      videoId
    }
  }).json<any>()
}

export async function generateDexaAnswerFromLex(query: string) {
  const url = `${config.apiBaseUrl}/api/dexa`

  return ky(url, {
    searchParams: {
      query
    },
    timeout: 30000
  }).json<{ answer: string }>()
}

export async function textToSpeech(text: string) {
  const url = `${config.apiBaseUrl}/api/tts`

  return ky
    .post(url, {
      json: {
        text: text
      },
      timeout: 60000
    })
    .json<{ audioUrl: string }>()
}
