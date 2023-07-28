import 'dotenv/config'

import { DexaClient } from '@/index'

async function main() {
  const dexa = new DexaClient()

  const res = await dexa.generateDexaAnswerFromLex('what is love?')
  console.log(res)
}

main()
