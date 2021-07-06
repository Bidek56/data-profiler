import Head from 'next/head'

const Page = ({ title, children }) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#ffffff" />
      {/* <link rel="manifest" href="/public/site.webmanifest" /> */}
      <link rel="icon" sizes="192x192" href="/public/icon.png" />
      <link rel="apple-touch-icon" href="/public/launcher-icon.png" />
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"
        integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS"
        crossOrigin="anonymous"
      />
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
