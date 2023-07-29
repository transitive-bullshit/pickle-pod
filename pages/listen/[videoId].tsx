import * as React from 'react'
import cs from 'clsx'
import { convertYouTubeDuration } from 'duration-iso-8601'
import Image from 'next/image'
import YouTube, { YouTubeEvent } from 'react-youtube'
import { format } from 'date-fns'
import { Button } from '@/components/Button/Button'
import { Drawer } from 'vaul'
import { fetchAssemblyAIRealtimeToken } from '@/lib/api'
import type RecordRTCType from 'recordrtc'

// import * as config from '@/lib/config'
import { Layout } from '@/components/Layout/Layout'
import { PageHead } from '@/components/PageHead/PageHead'
import { Play, Pause, HelpCircle } from '@/icons'
import * as types from '@/lib/types'

import styles from './styles.module.css'

let recorder: any
let recordedChunks: any = []
let socket: any

export default function ListenPage({ podcast }: { podcast: types.Podcast }) {
  const [playerStatus, setPlayerStatus] = React.useState<number>(-1)
  const [isMounted, setIsMounted] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [transcription, setTranscription] = React.useState('')
  const [isRecording, setIsRecording] = React.useState(false)
  const videoPlayer = React.useRef<any>(null)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const onPlayerReady = React.useCallback((event: YouTubeEvent) => {
    videoPlayer.current = event.target
  }, [])

  const onPlayerStateChanged = React.useCallback(() => {
    if (!videoPlayer.current) return

    const playerState: number = videoPlayer.current.getPlayerState()
    console.log(playerState)
    setPlayerStatus(playerState)
  }, [])

  const onClickPlayPause = React.useCallback(() => {
    if (!videoPlayer.current) return

    const playerState: number = videoPlayer.current.getPlayerState()
    if (playerState === 1) {
      videoPlayer.current.pauseVideo()
    } else {
      videoPlayer.current.playVideo()
    }
  }, [])

  const stopRecording = React.useCallback(() => {
    if (!socket || !recorder) return

    recorder.stopRecording(() => {
      setIsRecording(false)

      socket.send(JSON.stringify({ terminate_session: true }))
      socket.close()
      socket = null

      recorder.destroy()
      recorder = null
    })

    console.log(recordedChunks)
  }, [])

  const onClickAskQuestion = React.useCallback(async () => {
    if (!videoPlayer.current) return

    videoPlayer.current.pauseVideo()

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    })
    const RecordRTC = (await import('recordrtc'))
      .default as typeof RecordRTCType

    const token = await fetchAssemblyAIRealtimeToken()

    socket = new WebSocket(
      `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
    )
    const texts = {}

    socket.onmessage = (message: any) => {
      let msg = ''
      const res = JSON.parse(message.data)
      const msgType = res.message_type
      if (msgType === 'FinalTranscript') {
        stopRecording()
      }

      console.log('res: ' + JSON.stringify(res))

      texts[res.audio_start] = res.text
      const keys = Object.keys(texts)
      keys.sort((a, b) => a.localeCompare(b))

      for (const key of keys) {
        if (texts[key]) {
          if (msg.split(' ').length > 6) {
            msg = ''
          }
          msg += ` ${texts[key]}`
        }
      }

      setTranscription(msg)
      console.log('message', msg)
    }

    socket.onerror = (event: any) => {
      console.error(event)
      socket.close()
    }

    socket.onclose = (event: any) => {
      console.log(event)
      socket = null
    }

    socket.onopen = async () => {
      recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm;codecs=pcm',
        recorderType: RecordRTC.StereoAudioRecorder,
        timeSlice: 250,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
        bufferSize: 4096,
        audioBitsPerSecond: 128000,
        ondataavailable: function (blob) {
          const reader = new FileReader()
          reader.onload = () => {
            const base64data = reader.result as string

            if (socket) {
              socket.send(
                JSON.stringify({
                  audio_data: base64data.split('base64,')[1]
                })
              )
            }
          }

          reader.readAsDataURL(blob)
        }
      })

      recorder.startRecording()
    }

    setIsDialogOpen(true)
  }, [stopRecording])

  React.useEffect(() => {
    if (!isDialogOpen) {
      // clean up dialog state
    }
  }, [isDialogOpen])

  return (
    <Layout>
      <PageHead />

      <div className={styles.homePage}>
        <div className={styles.body}>
          <div className={cs(styles.section)}>
            <Image
              className={styles.thumbnail}
              src={podcast.thumbnailUrl}
              width={podcast.thumbnailWidth}
              height={podcast.thumbnailheight}
              alt='Youtube Thumbnail'
            />

            <YouTube
              className={styles.video}
              videoId={podcast.youtubeId}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChanged}
              opts={{
                width: '0',
                height: '0',
                playerVars: {
                  autoplay: 0
                }
              }}
            />

            <div className={styles.date}>{podcast.publishedAtFormatted}</div>

            <h1 className={cs(styles.title)}>{podcast.title}</h1>

            <div className={styles.actions}>
              <Button
                className={styles.actionButton}
                onClick={onClickPlayPause}
                isLoading={playerStatus < 0}
              >
                {playerStatus !== 1 ? (
                  <Play className={styles.actionIcon} />
                ) : (
                  <Pause className={styles.actionIcon} />
                )}
              </Button>

              <Button
                className={styles.actionButton}
                onClick={onClickAskQuestion}
              >
                <HelpCircle className={styles.actionIcon} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isMounted && (
        <Drawer.Root
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          dismissible
        >
          <Drawer.Overlay className='fixed inset-0 bg-black/40' />

          <Drawer.Portal>
            <Drawer.Content
              className='bg-zinc-100 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0'
              onEscapeKeyDown={() => setIsDialogOpen(false)}
              onInteractOutside={() => setIsDialogOpen(false)}
              onPointerDownOutside={() => setIsDialogOpen(false)}
            >
              <div className='p-4 bg-white rounded-t-[10px] flex-1'>
                <div className='mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8' />
                <div className='max-w-md mx-auto'>
                  <Drawer.Title className='font-medium mb-4'>
                    Speak your question.
                  </Drawer.Title>

                  <p className='text-zinc-600 mb-2'>
                    This component can be used as a replacement for a Dialog on
                    mobile and tablet devices.
                  </p>

                  <button
                    type='button'
                    onClick={() => setIsDialogOpen(false)}
                    className='rounded-md mb-6 w-full bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600'
                  >
                    Click to close
                  </button>
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </Layout>
  )
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { videoId: 'cdiD-9MMpb0' } }],
    fallback: 'blocking'
  }
}

export const getStaticProps = async (context) => {
  // TODO: make this dynamic using `videoId`
  // const videoId = context.params?.videoId as string
  const youtubeId = 'cdiD-9MMpb0'

  const podcast: types.Podcast = {
    youtubeId,
    title:
      'Andrej Karpathy: Tesla AI, Self-Driving, Optimus, Aliens, and AGI | Lex Fridman Podcast #333',
    description:
      "Andrej Karpathy is a legendary AI researcher, engineer, and educator. He's the former director of AI at Tesla, a founding member of OpenAI, and an educator at Stanford. Please support this podcast by checking out our sponsors:\n- Eight Sleep: https://www.eightsleep.com/lex to get special savings\n- BetterHelp: https://betterhelp.com/lex to get 10% off\n- Fundrise: https://fundrise.com/lex\n- Athletic Greens: https://athleticgreens.com/lex to get 1 month of fish oil\n\nEPISODE LINKS:\nAndrej's Twitter: http://twitter.com/karpathy\nAndrej's YouTube: http://youtube.com/c/AndrejKarpathy\nAndrej's Website: http://karpathy.ai\nAndrej's Google Scholar: http://scholar.google.com/citations?user=l8WuQJgAAAAJ\nBooks mentioned:\nThe Vital Question: https://amzn.to/3q0vN6q\nLife Ascending: https://amzn.to/3wKIsOE\nThe Selfish Gene: https://amzn.to/3TCo63s\nContact: https://amzn.to/3W3y5Au\nThe Cell: https://amzn.to/3W5f6pa\n\nPODCAST INFO:\nPodcast website: https://lexfridman.com/podcast\nApple Podcasts: https://apple.co/2lwqZIr\nSpotify: https://spoti.fi/2nEwCF8\nRSS: https://lexfridman.com/feed/podcast/\nFull episodes playlist: https://www.youtube.com/playlist?list=PLrAXtmErZgOdP_8GztsuKi9nrraNbKKp4\nClips playlist: https://www.youtube.com/playlist?list=PLrAXtmErZgOeciFP3CBCIEElOJeitOr41\n\nOUTLINE:\n0:00 - Introduction\n0:58 - Neural networks\n6:01 - Biology\n11:32 - Aliens\n21:43 - Universe\n33:34 - Transformers\n41:50 - Language models\n52:01 - Bots\n58:21 - Google's LaMDA\n1:05:44 - Software 2.0\n1:16:44 - Human annotation\n1:18:41 - Camera vision\n1:23:46 - Tesla's Data Engine\n1:27:56 - Tesla Vision\n1:34:26 - Elon Musk\n1:39:33 - Autonomous driving\n1:44:28 - Leaving Tesla\n1:49:55 - Tesla's Optimus\n1:59:01 - ImageNet\n2:01:40 - Data\n2:11:31 - Day in the life\n2:24:47 - Best IDE\n2:31:53 - arXiv\n2:36:23 - Advice for beginners\n2:45:40 - Artificial general intelligence\n2:59:00 - Movies\n3:04:53 - Future of human civilization\n3:09:13 - Book recommendations\n3:15:21 - Advice for young people\n3:17:12 - Future of machine learning\n3:24:00 - Meaning of life\n\nSOCIAL:\n- Twitter: https://twitter.com/lexfridman\n- LinkedIn: https://www.linkedin.com/in/lexfridman\n- Facebook: https://www.facebook.com/lexfridman\n- Instagram: https://www.instagram.com/lexfridman\n- Medium: https://medium.com/@lexfridman\n- Reddit: https://reddit.com/r/lexfridman\n- Support on Patreon: https://www.patreon.com/lexfridman",
    publishedAt: '2022-10-29T16:37:23Z',
    publishedAtFormatted: format(
      new Date('2022-10-29T16:37:23Z'),
      'MMMM dd, yyyy'
    ),
    channelId: 'UCSHZKyawb77ixDdsGog4iWA',
    channelTitle: 'Lex Fridman',
    youtubeUrl:
      'https://www.youtube.com/watch?v=cdiD-9MMpb0&ab_channel=LexFridman',
    thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    thumbnailWidth: 1280,
    thumbnailheight: 720,
    duration: 'PT3H28M48S'
  }

  return {
    props: {
      podcast
    }
  }
}
