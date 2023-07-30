import type { NextApiRequest, NextApiResponse } from 'next'

import { ElevenLabsClient, generateId, uploadToS3 } from '@/server'
import { ELEVEN_LABS_VOICE_ID } from '@/server/config'

const voiceId = ELEVEN_LABS_VOICE_ID

export default async function elevenLabsTextToSpeech(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const text: string = req.body.text
  if (!text) {
    res.status(400).json({ error: 'text is required' })
    return
  }

  try {
    const elevenLabs = new ElevenLabsClient()
    const audioBuffer = await elevenLabs.textToSpeech({ text, voiceId })

    const id = generateId()
    const key = `${voiceId}-${id}.mp3`
    const audioUrl = await uploadToS3({
      key,
      body: audioBuffer,
      metadata: {
        'Content-Type': 'audio/mpeg'
      }
    })

    res.json({ audioUrl })
  } catch (err) {
    console.error('tts api error', err)
    res.status(500).json(err)
  }
}
