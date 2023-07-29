import React from 'react'

function getVideoId(url: string): string {
  const urlObj = new URL(url)
  const videoId = urlObj.searchParams.get('v')
  return videoId
}

const YoutubeThumbnail = ({ videoURL }) => {
  // YouTube's URL for high quality (480x360) thumbnail
  const videoId: string = getVideoId(videoURL)
  const thumbnailUrl: string = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return (
    <div style={{ width: '100px', height: '100px', position: 'relative' }}>
      <img
        src={thumbnailUrl}
        alt='Youtube Thumbnail'
        style={{
          position: 'absolute',
          maxWidth: '100%',
          maxHeight: '100%',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  )
}

export default YoutubeThumbnail
