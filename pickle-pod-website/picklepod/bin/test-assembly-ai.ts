import 'dotenv/config'
import fs from 'fs/promises'

import { AssemblyAIClient } from '@/lib'

async function main() {
  const assembly = new AssemblyAIClient()

  // const input = await fs.readFile('audio/elevenlabs-lex-0.mp3')
  // const res = await assembly.uploadFile(input)
  // console.log(res)
  // return

  // const audioUrl =
  //   'https://cdn.assemblyai.com/upload/f3b9cf73-fac1-4fb6-a936-3b5f5371d782'
  // const transcription = await assembly.transcribeAudio({ audioUrl })
  // console.log(JSON.stringify(transcription, null, 2))

  const transcriptionId = '6lu3feagru-4093-4174-b0f2-77b790798075'
  const transcription = await assembly.getTranscriptionById(transcriptionId)
  console.log(JSON.stringify(transcription, null, 2))
}

main()
