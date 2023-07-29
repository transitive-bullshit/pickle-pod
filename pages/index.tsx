import React, { useState } from 'react'

import { Layout } from '@/components/Layout/Layout'
import { PageHead } from '@/components/PageHead/PageHead'
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
    <Layout>
      <PageHead />

      <h2 className='text-2xl font-bold text-center mt-4'>
        Welcome to Pickle Pod
      </h2>
      <p className='text-center mt-2 w-full'>
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
    </Layout>
  )
}

export default IndexPage
