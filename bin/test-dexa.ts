import 'dotenv/config'
import fs from 'fs/promises'
const { pipeline } = require('stream');
const { promisify } = require('util');

import { DexaClient } from '@/index'

const pipe = promisify(pipeline);

async function main() {
  const dexa = new DexaClient()

  const res = await dexa.generateDexaAnswerFromLex('what is love?')

  pipe(res, process.stdout);
  process.stdout.write('\n');
  // await fs.writeFile('test.mp3', res)
}

main()
