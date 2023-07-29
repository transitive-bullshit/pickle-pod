import ky from 'ky'
import type { NextApiRequest, NextApiResponse } from 'next'

import { YoutubeClient } from '@/server/youtube'

export default async function getYoutubeMetadata(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const videoId = req.query.videoId as string

  try {
    const youtube = new YoutubeClient()
    const metadata = await youtube.getMetadata(videoId)
    const data = {
      snippet: metadata.items[0]['snippet'],
      contentDetails: metadata.items[0]['contentDetails']
    }
    res.json(data)
  } catch (err) {
    console.error('google youtube metadata error', err)
    res.status(500).json(err)
  }
}
