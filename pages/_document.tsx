import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google AdSense Account Meta Tag */}
        {/* This meta tag verifies ownership for Google AdSense monetization */}
        <meta name="google-adsense-account" content="ca-pub-5418171625369886" />

        {/* Other meta tags can be added here */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}