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

## Tech Stack
- Assembly AI (for voice to text)
- Youtube API (to get metadata)
- Dexa API (to allow for Q/A interface)
- Eleven Labs (for text to voice)

## Please play at:  "[Demo](https://pickle-pod.vercel.app/)"

## Creators
- Sasha: A connoisseur of all things canine, Sasha finds joy in both hacking systems and goofing around. Often found talking in dog language to any pup within a three-mile radius. Sasha wears her passion on her sleeve, and her social media handle, as 'hackgoofer'.
- Travis: An aficionado of felines, Travis has a keen eye for the transitive property of balderdash. When he's not playing with kittens or immersed in complex theories, he's on a mission to make sense of the world's nonsense. Catch his hilarious insights at his social media handle, 'transitivebullshit'.
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
