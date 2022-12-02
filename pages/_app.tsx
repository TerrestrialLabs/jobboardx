import * as React from 'react';
import PropTypes from 'prop-types';
import '../styles/globals.css'
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import theme from '../config/theme';
import createEmotionCache from '../config/createEmotionCache';
import App, { AppContext, AppProps } from 'next/app';
import Layout from '../components/Layout';
import { NextApiRequest } from 'next';
import axios from 'axios';
import { JobBoardContext } from '../context/JobBoardContext';
import { useState } from 'react';
import { JobBoardData } from './api/jobboards';

const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
  jobboard: JobBoardData
  baseUrl: string
  baseUrlApi: string
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps, jobboard, baseUrl, baseUrlApi } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <JobBoardContext.Provider value={{ jobboard, baseUrl, baseUrlApi }}>
          <Layout>
          <Component {...pageProps} />
        </Layout>

        </JobBoardContext.Provider>
      </ThemeProvider>
    </CacheProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const pageProps = await App.getInitialProps(appContext)
  const { req } = appContext.ctx

  const protocol = req?.headers?.host?.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${req?.headers.host}/`
  const baseUrlApi = `${baseUrl}api/`

  const res = await axios.get(`${baseUrlApi}jobboards/current`)

  return { 
    ...pageProps,
    jobboard: res.data,
    baseUrl,
    baseUrlApi
  }
}