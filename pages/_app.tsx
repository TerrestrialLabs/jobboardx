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
import axios from 'axios';
import axiosInstance from '../api/axios';
import { JobBoardContext } from '../context/JobBoardContext';
import { SessionContext } from '../context/SessionContext';
import { useEffect, useRef, useState } from 'react';
import { JobBoardData } from './api/jobboards';
import { UserType } from '../models/User';
import { useRouter } from 'next/router';
import { AUTH_STATUS } from '../const/const';

const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
  jobboard: JobBoardData
  baseUrl: string
  baseUrlApi: string
}

type Session = {
  status: AUTH_STATUS
  user: UserType | null
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps, jobboard, baseUrl, baseUrlApi } = props;

  const [session, setSession] = useState<Session>({ status: AUTH_STATUS.LOADING, user: null })

  const router = useRouter()

  const login = (user: UserType) => {
    setSession({ status: AUTH_STATUS.AUTHENTICATED, user })
  }

  const logout = () => {
    axiosInstance.post(`${baseUrlApi}auth/logout`)
    setSession({ status: AUTH_STATUS.UNAUTHENTICATED, user: null })
  }

  // Prevent side effects if useEffect runs twice
  const effectRan = useRef(false)

  useEffect(() => {
    axios.defaults.baseURL = baseUrl.slice(0, -1)

    // Only check if we are logged in if we're not in the process of logging in
    if (!effectRan.current && router.pathname !== '/verify') {
      const verifyToken = async () => {
        try {
          const res = await axios.post(`${baseUrlApi}auth/verify`)

          if (res.status === 200 && res.data.accessToken && res.data.user) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`
            login(res.data.user)
          } else {
            logout()
          }
        } catch (err) {
          logout()
        }
      }

      verifyToken()
    }
    return () => { effectRan.current = true }
  }, [])

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SessionContext.Provider value={{ ...session, login, logout }}>
          <JobBoardContext.Provider value={{ jobboard, baseUrl, baseUrlApi }}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </JobBoardContext.Provider>
        </SessionContext.Provider>
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