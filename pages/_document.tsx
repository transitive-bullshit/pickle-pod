import * as React from 'react'
import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en' dir='ltr' className='dark'>
      <Head>
        <link rel='shortcut icon' href='/favicon.ico' />

        {/* TODO <link rel='icon' type='image/png' sizes='32x32' href='/icon.png' />
        <link rel='icon' type='image/svg+xml' href='/icon.svg' /> */}
      </Head>

      <body>
        <Main />

        <NextScript />
      </body>
    </Html>
  )
}
