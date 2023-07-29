import React from 'react'
import Select from 'react-select'
import type RecordRTCType from 'recordrtc'

const podcasters = [{ value: 'lex-fridman', label: 'Lex Fridman' }]

let recorder
let recordedChunks = []
let socket

const IndexPage = () => {
  const [selectedPodcaster, setSelectedPodcaster] = React.useState(
    podcasters[0]
  )
  const [transcription, setTranscription] = React.useState('')
  const [isRecording, setIsRecording] = React.useState(false)

  const handleChange = (selectedOption) => {
    setSelectedPodcaster(selectedOption)
  }

  const startRecording = async () => {
    console.log('start recording')

    const token = await fetchToken()

    console.log('captured token: ' + token)
    setIsRecording(true) // set isRecording to true when recording starts

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

  const fetchToken = async () => {
    try {
      const url = 'http://localhost:3000/api/token'

      const response = await fetch(url)
      const data = await response.json()

      if (data.error) {
        alert(data.error)
      }

      const { token } = data
      return token
    } catch (error) {
      const {
        response: { status, data }
      } = error
      console.error(status, data)
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
    <div
      className='flex flex-col items-center justify-center min-h-screen py-2'
      style={{ backgroundColor: isRecording ? 'green' : 'yellow' }}
    >
      <div className='flex flex-col w-full p-8 text-gray-800 bg-white shadow-lg rounded-2xl'>
        <div className='flex items-center justify-center'>
          <div className='p-3'>
            <div className='text-xl font-medium text-gray-700'>
              Select a Podcaster
            </div>

            <Select
              instanceId={podcasters[0].value}
              options={podcasters}
              value={selectedPodcaster}
              onChange={handleChange}
              isSearchable={true}
              placeholder='Select a podcaster...'
            />
          </div>
        </div>

        <div className='flex items-center justify-center mt-6'>
          <button
            onClick={startRecording}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2'
          >
            Start Recording
          </button>

          <button
            onClick={stopRecording}
            className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-2'
          >
            Stop Recording
          </button>
        </div>

        <div className='transcription mt-6 text-center'>
          {/* add this div to display the transcription */}
          <h2>Transcription</h2>

          <p>{transcription}</p>
        </div>
      </div>
    </div>
  )
}

export default IndexPage
