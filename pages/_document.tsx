import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google AdSense Account Meta Tag */}
        {/* This meta tag verifies ownership for Google AdSense monetization */}
        <meta name="google-adsense-account" content="ca-pub-5418171625369886" />

        {/* Google AdSense Code Snippet */}
        {/* This code enables ads to be displayed on the site */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5418171625369886"
          crossOrigin="anonymous"
        />

        {/* Other meta tags can be added here */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}