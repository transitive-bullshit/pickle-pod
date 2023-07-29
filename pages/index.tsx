import React, { useState } from 'react'

import { Input } from '@/components/ui/input'

const podcasters = [{ value: 'lex-fridman', label: 'Lex Fridman' }]

const IndexPage = () => {
  const [selectedPodcaster, setSelectedPodcaster] = React.useState(
    podcasters[0]
  )
  const [url, setUrl] = useState('')

  const handleStart = () => {
    // Handle the start button click here
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='p-6 bg-white rounded shadow-md w-full max-w-md flex flex-col items-center justify-center'>
        <img src='./pickle.jpg' alt='Pickle Logo' className='h-16 w-16' />
        <h2 className='text-2xl font-bold text-center mt-4'>
          Welcome to Pickle Pod
        </h2>
        <p className='text-center mt-2'>
          Please enter the YouTube URL you want to process
        </p>
        <Input
          className='mt-4 w-full p-2 border rounded'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder='YouTube URL'
        />
        <button
          className='mt-4 w-full py-2 bg-blue-500 text-white rounded'
          onClick={handleStart}
        >
          Start
        </button>
      </div>
    </div>

    /* 
          {<div
      className='flex flex-col items-center justify-center min-h-screen py-2 w-full'
      style={{ backgroundColor: isRecording ? 'green' : 'yellow' }}
    >
    <div className='flex flex-col w-full p-8 text-gray-800 bg-white shadow-lg rounded-2xl'>
        <div className='flex items-center justify-center mt-20'>
          <div className='p-3'>
            <div
              style={{
                display: 'flex',
                padding: '0 20px',
                flexWrap: 'wrap',
                gap: 15,
                alignItems: 'center',
                marginBottom: 20
              }}
            >
              <Label.Root className='LabelRoot' htmlFor='podcaster'>
                Select a podcaster:
              </Label.Root>
              <Select
                id='podcaster'
                instanceId={podcasters[0].value}
                options={podcasters}
                value={selectedPodcaster}
                onChange={handleChange}
                isSearchable={true}
                placeholder='Select a podcaster...'
              />
              <Label.Root className='LabelRoot' htmlFor='firstName'>
                Enter a URL:
              </Label.Root>
              <input
                className='Input'
                type='text'
                id='firstName'
                defaultValue='Pedro Duarte'
              />
            </div>
          </div>
        </div>
        <AspectRatio.Root ratio={1 / 1} className='w-24 h-24'>
          <img
            className='object-cover w-full h-full'
            src={imageSrc}
            alt='Landscape photograph by Tobias Tullius'
          />
        </AspectRatio.Root>
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
          <h2>Transcription</h2>
          <p>{transcription}</p>
        </div>
      </div> 
        </div>}*/
  )
}

export default IndexPage
