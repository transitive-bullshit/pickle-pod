import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

import { Layout } from '@/components/Layout/Layout'
import { PageHead } from '@/components/PageHead/PageHead'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getYoutubeMetadata } from '@/lib/api'

const podcasters = [{ value: 'lex-fridman', label: 'Lex Fridman' }]

const IndexPage = () => {
  const router = useRouter()

  const [url, setUrl] = useState('')
  const [videoId, setVideoId] = useState('')

  const handleStart = async () => {
    // Handle the start button click here
    if (isValidYoutubeUrl(url)) {
      const videoId = getVideoId(url)
      setVideoId(videoId)

      try {
        const metadata = await getYoutubeMetadata(videoId)

        if (metadata == undefined) {
          handleError('Please enter a valid Youtube URL. Metadata not found.')
          return
        }

        if (
          !metadata.snippet.channelTitle.toLowerCase().includes('lex') ||
          !metadata.snippet.channelTitle.toLowerCase().includes('fridman')
        ) {
          handleError('Please make sure only lex fridman videos are used.')
          return
        }
      } catch {
        handleError('Please enter a valid Youtube URL. Metadata fetch errored.')
        return
      }

      router.push(`/listen/${videoId}`)
    } else {
      toast.error('Please enter a valid Youtube URL. URL not valid.')
      return
    }
  }

  const handleError = (error: string) => {
    setVideoId('')
    setUrl('')
    toast.error(error)
  }

  const handleURLOnChange = async (e) => {
    const enteredURL: string = e.target.value
    setUrl(enteredURL)
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
      <Button className='mt-4' variant='outline' onClick={handleStart}>
        Go
      </Button>
      <Toaster />
    </Layout>
  )
}

export default IndexPage
