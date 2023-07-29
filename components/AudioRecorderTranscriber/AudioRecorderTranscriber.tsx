import React from 'react'
import type RecordRTCType from 'recordrtc'
import cs from 'clsx'

import styles from './styles.module.css'
import { fetchAssemblyAIRealtimeToken } from '@/lib/api'

let recorder
let recordedChunks = []
let socket

export const AudioRecorderTranscriber = ({
  className
}: {
  className?: string
}) => {
  const [transcription, setTranscription] = React.useState('')
  const [isRecording, setIsRecording] = React.useState(false)

  const startRecording = async () => {
    console.log('start recording')

    const token = await fetchAssemblyAIRealtimeToken()
    setIsRecording(true)

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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      })

      const RecordRTC = (await import('recordrtc'))
        .default as typeof RecordRTCType

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
  }

  const stopRecording = () => {
    recorder.stopRecording(stopRecordingCallback)
    console.log(recordedChunks)
  }

  // Stops recording and ends real-time session.
  const stopRecordingCallback = () => {
    setIsRecording(false)

    socket.send(JSON.stringify({ terminate_session: true }))
    socket.close()
    socket = null

    recorder.destroy()
    recorder = null
  }

  return (
    <div className={cs(styles.container, className)}>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>

      <div className={styles.transcription}>{transcription}</div>
    </div>
  )
}
