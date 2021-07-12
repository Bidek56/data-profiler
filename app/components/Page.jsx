import Head from 'next/head'

const Page = ({ title, children }) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="shortcut icon" type="image/x-icon" sizes="192x192" href="/icon.png" />
      <link rel="apple-touch-icon" href="/launcher-icon.png" />
    </Head>
    {children}
    <style jsx global>{`
      html {
        font-family: 'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial,
          sans-serif;
        background-color: white;
      }
      body {
        margin: 2em;
      }
    `}</style>
  </div>
)

export default Page
