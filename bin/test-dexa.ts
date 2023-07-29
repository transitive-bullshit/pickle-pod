import 'dotenv/config'

import { DexaClient } from '@/lib'

async function main() {
  const dexa = new DexaClient()

  const p =
    'My disadvantage is I grew up in poverty. How can I convert my disadvantage into a superpower, Mr. Fridman?'
  const res = await dexa.generateDexaAnswerFromLex(p)
  console.log(res)
}

main()
