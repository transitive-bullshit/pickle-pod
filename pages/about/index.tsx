import * as React from 'react'
import { InferGetStaticPropsType } from 'next'

import * as config from '@/lib/config'
import { Layout } from '@/components/Layout/Layout'
import { Markdown } from '@/components/Markdown/Markdown'
import { markdownToHtml } from '@/server/markdown-to-html'

import styles from './styles.module.css'

const markdownContent = `
# About

Hello there! We appreciate your curiosity about our project. It was just last Friday when we had an exhilarating brainstorming session that led to the birth of this project. Our shared fascination for "Rick and Morty" ignited the idea, hence the name, inspired by none other than Pickle Rick. You might wonder, "How exactly does 'pickle' relate to this project?" Honestly, we're exploring that mystery ourselves. Regardless, we hope you find joy in this unique creation of ours. Enjoy!

## How it works

- [Assembly AI](https://www.assemblyai.com) is used for real-time speech-to-text, so users can ask the podcast host questions using their voice.
- [Dexa AI](https://dexa.ai) is used to generate realistic answers to text queries in the style of Lex Fridman, with a custom private RAG API trained on the transcripts across all ~400 episodes of the [Lex Fridman Podcast](https://lexfridman.com/podcast/).
  - Dexa uses Pinecone hybrid search to retrieve the most relevant podcast chunks, applies cross-validation and re-ranking to ensure we only take into account transcript chunks that are relevant to the question, uses RAG + GPT-4 to generate an answer in the style of Lex Fridman, and then applies a post-processing step to minimize hallucination.
- [ElevenLabs](https://elevenlabs.io) is used for text-to-speech to convert the resulting answer to audio using a custom voice trained on ~7 minutes of Lex Fridman's voice.

## Creators

![Sasha](https://pbs.twimg.com/profile_images/1652410947238252544/Bz1MvaNg_400x400.jpg)
- Sasha: A lover of dogs, Sasha finds joy in both hacking systems and goofing around. Often found talking in dog language to any pup within a three-mile radius. Sasha wears her passion on her sleeve, and her twitter [@hackgoofer](https://twitter.com/hackgoofer).

![Travis](https://pbs.twimg.com/profile_images/1347656662463766529/igIs8izN_400x400.png)
- Travis: A feline aficionado, Travis has a keen eye for the transitive property of bullshit... When he's not playing with kittens or buildin gAI appes, he's on a mission to make sense of the world's nonsense. Catch his hilarious insights on twitter [@transitive_bs](https://twitter.com/transitive_bs).
`

export default function AboutPage({
  content
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout>
      <div className={styles.aboutPage}>
        <div className={styles.meta}>
          <h1 className={styles.title}>{config.title}</h1>
        </div>

        <Markdown content={content} />
      </div>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const content = await markdownToHtml(markdownContent)

  return {
    props: {
      content
    }
  }
}
