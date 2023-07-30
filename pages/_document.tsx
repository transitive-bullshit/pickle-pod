import * as React from 'react'
import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en' dir='ltr'>
      <Head>
        <link rel='shortcut icon' href='/favicon.ico' />

        <link rel='icon' type='image/png' sizes='32x32' href='/logo-32.png' />
        <link rel='icon' type='image/png' sizes='64x64' href='/logo-64.png' />
        <link
          rel='icon'
          type='image/png'
          sizes='128x128'
          href='/logo-128.png'
        />
      </Head>

      <body>
        <Main />

        <NextScript />
      </body>
    </Html>
  )
}
