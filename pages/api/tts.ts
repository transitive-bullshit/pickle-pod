import type { NextApiRequest, NextApiResponse } from 'next'
import { ElevenLabsClient, uploadToS3, generateId } from '@/lib'

const voiceId = 'U1iLAvrBdqSzHH89CB7p'

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
