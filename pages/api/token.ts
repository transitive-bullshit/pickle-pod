import ky from 'ky'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function getAssemblyAIRealtimeToken(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = await ky
      .post('https://api.assemblyai.com/v2/realtime/token', {
        json: { expires_in: 3600 },
        headers: { authorization: process.env.ASSEMBLY_AI_API_KEY }
      })
      .json()

    res.json(token)
  } catch (err) {
    console.error('assembly ai token error', err)
    res.status(500).json(err)
  }
}
