import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import { OrbitDbProvider } from '../components/orbitdb'

function MyApp (props) {
  const { Component, pageProps } = props
  return (
    <>
      <Head>
        {/* <script src="/env.js" /> */}
      </Head>
      <OrbitDbProvider>
          <Component {...pageProps} />
      </OrbitDbProvider>
    </>
  )
}

export default MyApp;
