import * as React from 'react'
import cs from 'clsx'

// import * as config from '@/lib/config'
import { Layout } from '@/components/Layout/Layout'
import { PageHead } from '@/components/PageHead/PageHead'

import styles from './listen.module.css'
import { AudioRecorderTranscriber } from '@/components/AudioRecorderTranscriber/AudioRecorderTranscriber'

export default function ListenPage() {
  return (
    <Layout>
      <PageHead />

      <div className={styles.homePage}>
        <div className={styles.body}>
          <div className={cs(styles.section, styles.hero)}>
            <h1 className={cs(styles.title)}>TODO</h1>

            <AudioRecorderTranscriber />
          </div>
        </div>
      </div>
    </Layout>
  )
}

// export async function getStaticProps() {
//   return {
//     props: {
//       // TODO
//     },
//     // revalidate: 10 * 60
//   }
// }
