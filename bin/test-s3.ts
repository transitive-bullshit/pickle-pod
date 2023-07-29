import 'dotenv/config'
import fs from 'fs/promises'
import { uploadToS3 } from '@/server'

async function main() {
  const filename = 'test.mp3'
  const file = await fs.readFile(filename)
  const url = await uploadToS3({
    key: filename,
    body: file
  })
  console.log(url)
}

main()
