import defaultKy from 'ky'

const ELEVEN_LABS_API_BASE_URL = 'https://api.elevenlabs.io'

type Category = 'premade' | 'cloned'
type Age = 'middle aged' | 'young' | 'old'
type Gender = 'male' | 'female'

interface Voice {
  voice_id: string
  name: string
  samples: Sample[] | null
  category: Category
  fine_tuning: FineTuning
  labels: Labels
  description: null | string
  preview_url: string
  available_for_tiers: any[]
  settings: null
  sharing: null
  high_quality_base_model_ids: string[]
}

interface FineTuning {
  language: null
  is_allowed_to_fine_tune: boolean
  fine_tuning_requested: boolean
  finetuning_state: string
  verification_attempts: null
  verification_failures: any[]
  verification_attempts_count: number
  slice_ids: null
  manual_verification: null
  manual_verification_requested: boolean
}

interface Labels {
  accent?: string
  description?: string
  age?: Age
  gender?: Gender
  'use case'?: string
  'description '?: string
  'age '?: Age
  usecase?: string
  'accent '?: string
}

interface Sample {
  sample_id: string
  file_name: string
  mime_type: string
  size_bytes: number
  hash: string
}

interface Model {
  model_id: string
  name: string
  can_be_finetuned: boolean
  can_do_text_to_speech: boolean
  can_do_voice_conversion: boolean
  can_use_style: boolean
  can_use_speaker_boost: boolean
  serves_pro_voices: boolean
  token_cost_factor: number
  description: string
  requires_alpha_access: boolean
  max_characters_request_free_user: number
  max_characters_request_subscribed_user: number
  languages: Language[]
}

interface Language {
  language_id: string
  name: string
}

interface TextToSpeechOptions {
  text: string
  voiceId: string
  optimizeStreamingLatency?: number
  modelId?: string | 'eleven_monolingual_v1' | 'eleven_multilingual_v1'
  stability?: number
  similarityBoost?: number
}

interface VoiceSettings {
  stability: number
  similarity_boost: number
}

export class ElevenLabsClient {
  readonly api: typeof defaultKy

  constructor({
    apiKey = process.env.ELEVEN_LABS_API_KEY,
    apiBaseUrl = ELEVEN_LABS_API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: typeof defaultKy
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error ElevenLabs missing required "apiKey"`)
    }

    this.api = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        'xi-api-key': apiKey
      }
    })
  }

  async textToSpeech({
    text,
    voiceId,
    optimizeStreamingLatency = 0,
    modelId,
    stability = 0.5,
    similarityBoost = 0.75
  }: TextToSpeechOptions) {
    const res = await this.api
      .post(`v1/text-to-speech/${voiceId}`, {
        searchParams: {
          optimize_streaming_latency: optimizeStreamingLatency
        },
        json: {
          text,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost
          },
          model_id: modelId
        },
        headers: {
          accept: 'audio/mpeg'
        }
      })
      .arrayBuffer()

    return Buffer.from(res)
  }

  async textToSpeechStream({
    text,
    voiceId,
    optimizeStreamingLatency = 0,
    modelId,
    stability,
    similarityBoost
  }: TextToSpeechOptions) {
    return this.api.post(`v1/text-to-speech/${voiceId}/stream`, {
      searchParams: {
        optimize_streaming_latency: optimizeStreamingLatency
      },
      json: {
        text,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost
        },
        model_id: modelId
      },
      headers: {
        accept: 'audio/mpeg'
      }
    })
  }

  async getVoices() {
    return this.api.get('v1/voices').json<{
      voices: Voice[]
    }>()
  }

  async getVoiceById(voiceId: string) {
    return this.api.get(`v1/voices/${voiceId}`).json<Voice>()
  }

  async getDefaultVoiceSettings() {
    return this.api.get('v1/voices/settings/default').json<VoiceSettings>()
  }

  async getVoiceSettings(voiceId: string) {
    return this.api.get(`v1/voices/${voiceId}/settings`).json<VoiceSettings>()
  }

  async updateVoiceSettings(
    voiceId: string,
    {
      stability,
      similarityBoost
    }: {
      stability: number
      similarityBoost: number
    }
  ) {
    return this.api
      .post(`v1/voices/${voiceId}/settings/edit`, {
        json: {
          stability: stability,
          similarity_boost: similarityBoost
        }
      })
      .json<any>()
  }

  async getModels() {
    return this.api.get('v1/models').json<Model[]>()
  }
}
