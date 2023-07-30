import Link from 'next/link'
import React, { useState } from 'react'

import { Layout } from '@/components/Layout/Layout'
import { PageHead } from '@/components/PageHead/PageHead'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const podcasters = [{ value: 'lex-fridman', label: 'Lex Fridman' }]

const IndexPage = () => {
  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState('')

  const handleStart = () => {
    // Handle the start button click here
    console.log('start')
  }

  const handleURLOnChange = async (e) => {
    const enteredURL: string = e.target.value
    setUrl(enteredURL)

    if (isValidYoutubeUrl(enteredURL)) {
      const videoId = getVideoId(enteredURL)
      setVideoId(videoId)

      // import {
      //   generateDexaAnswerFromLex,
      //   getYoutubeMetadata,
      //   textToSpeech
      // } from '@/lib/api'
      // const metadata = await getMetadata(videoId)
      // const dexaAnswer = await generateDexaAnswerFromLex(
      //   'My disadvantage is I grew up in poverty. How can I convert my disadvantage into a superpower, Mr. Fridman?'
      // )
      // const speech = await textToSpeech(dexaAnswer['answer'])
      // console.log(speech)
    }
  }

  const getVideoId = (url) => {
    const urlObj = new URL(url)
    var videoId
    if (urlObj.hostname === 'www.youtube.com') {
      videoId = new URLSearchParams(urlObj.search).get('v')
    } else if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.split('/')[1]
    }

    return videoId
  }

  function isValidYoutubeUrl(url) {
    const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/
    return regex.test(url)
  }

  return (
    <Layout>
      <PageHead />
      <h2 className='text-2xl font-bold text-center mt-4'>
        Welcome to Pickle Pod
      </h2>
      <p className='text-center mt-2 w-full'>Please enter the YouTube URL</p>
      <Input
        type='youtube'
        className='mt-4 w-full p-2 border rounded'
        value={url}
        onChange={handleURLOnChange}
        placeholder='YouTube URL'
      />
      <Link href={`/listen/${videoId}`}>
        <Button className='mt-4' variant='outline' onClick={handleStart}>
          Go
        </Button>
      </Link>
    </Layout>
  )
}

export default IndexPage
