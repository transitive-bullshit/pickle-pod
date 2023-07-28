import defaultKy from 'ky'

import { delay } from './utils'

const ASSEMBLY_AI_API_BASE_URL = 'https://api.assemblyai.com'

interface AssemblyAIUpload {
  upload_url: string
}

type JobStatus = 'queued' | 'processing' | 'completed' | 'error'

interface Transcription {
  id: string
  language_model: string
  acoustic_model: string
  language_code: string
  status: JobStatus
  audio_url: string
  text: string
  words: Word[] | null
  utterances: any[] | null
  confidence: number | null
  audio_duration: number | null
  punctuate: boolean
  format_text: boolean
  dual_channel: null
  webhook_url: null
  webhook_status_code: null
  webhook_auth: boolean
  webhook_auth_header_name: null
  speed_boost: boolean
  auto_highlights_result: null
  auto_highlights: boolean
  audio_start_from: null
  audio_end_at: null
  word_boost: any[]
  boost_param: null
  filter_profanity: boolean
  redact_pii: boolean
  redact_pii_audio: boolean
  redact_pii_audio_quality: null
  redact_pii_policies: null
  redact_pii_sub: null
  speaker_labels: boolean
  content_safety: boolean
  iab_categories: boolean
  content_safety_labels: ContentSafetyLabels
  iab_categories_result: ContentSafetyLabels
  language_detection: boolean
  custom_spelling: null
  throttled: null
  auto_chapters: boolean
  summarization: boolean
  summary_type: null
  summary_model: null
  custom_topics: boolean
  topics: any[]
  speech_threshold: null
  disfluencies: boolean
  sentiment_analysis: boolean
  chapters: any[] | null
  sentiment_analysis_results: any | null
  entity_detection: boolean
  entities: any[] | null
  summary: any | null
  speakers_expected: null
  error?: string
}

interface ContentSafetyLabels {
  status: string
  results: any[]
  summary: any
}

interface Word {
  text: string
  start: number
  end: number
  confidence: number
  speaker: any | null
}

export class AssemblyAIClient {
  readonly api: typeof defaultKy

  constructor({
    apiKey = process.env.ASSEMBLY_AI_API_KEY,
    apiBaseUrl = ASSEMBLY_AI_API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: typeof defaultKy
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error AssemblyAI missing required "apiKey"`)
    }

    this.api = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        authorization: apiKey
      }
    })
  }

  /**
   * @see https://www.assemblyai.com/docs/API%20reference/upload
   */
  async uploadFile(fileBuffer: Buffer) {
    return this.api
      .post('v2/upload', {
        body: fileBuffer,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      })
      .json<AssemblyAIUpload>()
  }

  /**
   * @see https://www.assemblyai.com/docs/API%20reference/transcript
   */
  async transcribeAudio({
    audioUrl,
    pollIntervalMs = 3000
  }: {
    audioUrl: string
    pollIntervalMs?: number
  }) {
    const transcription = await this.api
      .post('v2/transcript', {
        json: {
          audio_url: audioUrl
        },
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      })
      .json<Transcription>()

    do {
      const transcriptionResult = await this.getTranscriptionById(
        transcription.id
      )

      if (transcriptionResult.status === 'completed') {
        return transcriptionResult
      } else if (transcriptionResult.status === 'error') {
        throw new Error(`Transcription failed: ${transcriptionResult.error}`)
      }

      await delay(pollIntervalMs)
    } while (true)
  }

  async getTranscriptionById(id: string) {
    return this.api.get(`v2/transcript/${id}`).json<Transcription>()
  }
}
