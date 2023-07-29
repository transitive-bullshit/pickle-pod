import type { NextApiRequest, NextApiResponse } from 'next'
import { DexaClient } from '@/server'

export default async function generateDexaAnswerFromLex(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const query = req.query.query as string
  if (!query) {
    res.status(400).json({ error: 'query is required' })
    return
  }

  try {
    const dexa = new DexaClient()
    const answer = await dexa.generateDexaAnswerFromLex(query)

    res.json({ answer })
  } catch (err) {
    console.error('dexa api error', err)
    res.status(500).json(err)
  }
}
