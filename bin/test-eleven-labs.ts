import 'dotenv/config'
import fs from 'fs/promises'

import { ElevenLabsClient } from '@/server'
import { ELEVEN_LABS_VOICE_ID } from '@/server/config'

async function main() {
  const voiceId = ELEVEN_LABS_VOICE_ID
  const elevenLabs = new ElevenLabsClient()

  // const v = await elevenLabs.getVoices()
  // console.log(v)
  // return

  const res = await elevenLabs.textToSpeech({
    text: 'Hello world - this is the Lex Freedman podcast.',
    voiceId
  })

  console.log(res.byteLength)
  await fs.writeFile('test.mp3', res)
}

main()
