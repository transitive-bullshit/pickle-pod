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
    // text: 'Hello world - this is the Lex Freedman podcast.',
    text: `Meditation is a practice of focus and it's natural to experience distractions. As I discussed with Sam Harris, meditation is about training yourself to be present in the moment. When you notice you're distracted, simply recognize it and return to your focus. It's not about eliminating distractions entirely, but rather learning to navigate them. It's a process, so be patient with yourself. You might also find it helpful to use a guided meditation app, like Sam Harris's "Waking Up", which I've personally found beneficial.`,
    voiceId
  })

  console.log(res.byteLength)
  await fs.writeFile('test-meditation.mp3', res)
}

main()
