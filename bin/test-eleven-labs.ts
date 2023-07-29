import 'dotenv/config'
import fs from 'fs/promises'

import { ElevenLabsClient } from '@/lib'

async function main() {
  const voiceId = 'U1iLAvrBdqSzHH89CB7p'
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
