import React, { useState } from 'react'
import Select from 'react-select'
import type RecordRTCType from 'recordrtc'

const podcasters = [{ value: 'lex-fridman', label: 'Lex Fridman' }]

let recorder
let recordedChunks = []
let socket

let options = {
  audioBitsPerSecond: 128000,
  mimeType: 'audio/webm;codecs=pcm'
}

const startRecording = () => {
  console.log('start recording')

  // Assembly AI audio requirments:
  // WAV PCM16
  //   A sample rate that matches the value of the sample_rate query param you supply
  // Single-channel
  //   100 to 2000 milliseconds of audio per message

  fetchToken()
    .then(async (token) => {
      // Handle the data returned by fetchToken here.
      console.log('captured token: ' + token)

      socket = await new WebSocket(
        `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
      )
      const texts = {}

      socket.onmessage = (message) => {
        let msg = ''
        const res = JSON.parse(message.data)
        console.log('res: ' + JSON.stringify(res))

        texts[res.audio_start] = res.text
        const keys = Object.keys(texts)
        keys.sort((a, b) => a - b)
        for (const key of keys) {
          if (texts[key]) {
            if (msg.split(' ').length > 6) {
              msg = ''
            }
            msg += ` ${texts[key]}`
          }
        }
        // captions.innerText = msg;
        console.log('recorded message: ' + msg)
      }

      socket.onerror = (event) => {
        console.error(event)
        socket.close()
      }

      socket.onclose = (event) => {
        console.log(event)
        // captions.innerText = ''
        socket = null
      }

      socket.onopen = async () => {
        console.log('onopen')
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        })

        console.log(stream)
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
              const base64data = reader.result
              if (socket) {
                socket.send(
                  JSON.stringify({ audio_data: base64data.split('base64,')[1] })
                )
              }
            }
            reader.readAsDataURL(blob)
          }
        })

        recorder.startRecording()
      }
    })
    .catch((error) => {
      // Handle any error occurred in fetchToken here.
      console.error(error)
    })
}

const fetchToken = async () => {
  try {
    const url = 'http://localhost:3000/api/token'

    const response = await fetch(url) // get temp session token from server.js (backend)
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
    console.log(status, data)
  }
}

const stopRecording = () => {
  recorder.stopRecording(stopRecordingCallback)
  console.log(recordedChunks)
}

// Stops recording and ends real-time session.
const stopRecordingCallback = () => {
  socket.send(JSON.stringify({ terminate_session: true }))
  socket.close()
  socket = null

  recorder.destroy()
  recorder = null
}

const IndexPage = () => {
  const [selectedPodcaster, setSelectedPodcaster] = useState(null)

  const handleChange = (selectedOption) => {
    setSelectedPodcaster(selectedOption)
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
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
      </div>
    </div>
  )
}

export default IndexPage
